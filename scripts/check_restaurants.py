import json

input_path = r'c:\Users\Norit\OneDrive\Desktop\LIGJERATAT\VITI I 3-të\SEMESTRI 6\Kurs Laboratorik\restaurants.json'

with open(input_path, encoding='utf-8') as f:
    data = json.load(f)

print(f'Total restaurants in JSON: {len(data)}')
print(f'Cities: Prishtina={sum(1 for r in data if r.get("city","")=="Prishtina")}, Prizren={sum(1 for r in data if r.get("city","")=="Prizren")}, Peje={sum(1 for r in data if r.get("city","")=="Peje")}')