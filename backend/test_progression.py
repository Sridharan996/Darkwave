import urllib.request
import json

def test_pred(c, s, u, t, d):
    data = json.dumps({
        'cloud_cover_percent': c,
        'solar_irradiance': s,
        'underwater_light_level': u,
        'turbidity': t,
        'time_of_day': 14.32,
        'low_light_duration_minutes': d
    }).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/predict', data=data, headers={'Content-Type': 'application/json'})
    res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    print(f"Duration {d:.1f}s: illumination_required = {res['illumination_required']}, prob = {res['probability']:.4f}")

print("=== CLOUDY PROGRESSION TEST ===")
for sec in [0.0, 1.0, 2.0, 3.0, 4.0, 5.0]:
    test_pred(78.0, 158.0, 148.0, 28.0, sec)

print("\n=== SUNLIGHT RESTORATION TEST ===")
test_pred(12.0, 920.0, 740.0, 8.0, 0.0)
