param(
  [string]$HadoopHome = $env:HADOOP_HOME,
  [string]$JavaHome = $env:JAVA_HOME
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$sparkRoot = Join-Path $root 'spark-scala-service'
$backendRoot = Join-Path $root 'backend'

if (-not $JavaHome) {
  $JavaHome = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot'
}
if (-not (Test-Path (Join-Path $JavaHome 'bin\java.exe'))) {
  throw "Java runtime not found at $JavaHome"
}
if (-not $HadoopHome) {
  throw 'Set HADOOP_HOME to the verified Hadoop 3.4.1 native package before starting.'
}
foreach ($file in @('bin\winutils.exe', 'bin\hadoop.dll', 'bin\hdfs.dll')) {
  if (-not (Test-Path (Join-Path $HadoopHome $file))) {
    throw "Required Hadoop native file is missing: $(Join-Path $HadoopHome $file)"
  }
}

$env:JAVA_HOME = $JavaHome
$env:HADOOP_HOME = $HadoopHome
$env:PATH = "$JavaHome\bin;$HadoopHome\bin;$env:PATH"
$env:AQUALUME_SPARK_RUNTIME = Join-Path $sparkRoot 'runtime'
$env:SPARK_SERVICE_URL = 'http://127.0.0.1:18080'

$sbtLauncher = (Get-Command sbt.bat -ErrorAction Stop).Source
$sparkProcess = Start-Process -FilePath $env:ComSpec -WorkingDirectory $sparkRoot -ArgumentList '/c', 'call', "`"$sbtLauncher`"", '--server', 'run' -PassThru
$backendProcess = Start-Process -FilePath 'python.exe' -WorkingDirectory $backendRoot -ArgumentList '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000' -PassThru

try {
  $sparkHealth = $null
  $backendHealth = $null
  for ($attempt = 1; $attempt -le 30; $attempt++) {
    Start-Sleep -Seconds 2
    try { $sparkHealth = Invoke-RestMethod "$env:SPARK_SERVICE_URL/health" } catch {}
    try { $backendHealth = Invoke-RestMethod 'http://127.0.0.1:8000/' } catch {}
    if ($sparkHealth.status -eq 'UP' -and $backendHealth.status -eq 'OPERATIONAL') { break }
  }
  if ($sparkHealth.status -ne 'UP') { throw 'Spark health check failed.' }
  if ($backendHealth.status -ne 'OPERATIONAL') { throw 'FastAPI health check failed.' }
  Write-Output "Spark: $($sparkHealth.status) ($($sparkHealth.spark_version), Scala $($sparkHealth.scala_version))"
  Write-Output "FastAPI: $($backendHealth.status)"
  Write-Output 'All readings are synthetic/simulated; no physical hardware is connected.'
  Wait-Process -Id $sparkProcess.Id
}
finally {
  if (-not $sparkProcess.HasExited) { Stop-Process -Id $sparkProcess.Id }
  if (-not $backendProcess.HasExited) { Stop-Process -Id $backendProcess.Id }
}
