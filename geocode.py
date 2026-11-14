import json, time, urllib.request, urllib.parse

bairros = [
 "Cobilândia","Nova Cobilândia","Cobi de Baixo","Rio Marinho","Nova América","São Torquato",
 "Terra Vermelha","Barramares","São Conrado","Ulisses Guimarães","Vinte e Três de Maio","Cidade da Barra",
 "Riviera da Barra","Santa Paula","João Goulart","Normília da Cunha","Morada da Barra",
 "Pontal das Garças","Darly Santos","Barra do Jucu","Jardim Guaranhuns","Guaranhuns","Araçás",
 "Ilha dos Bentos","Santa Mônica","Nossa Senhora da Penha","Ibes",
 "Centro","Glória","Itapuã","Praia da Costa","Jockey de Itaparica","Soteco","Divino Espírito Santo","Itaparica",
 "Aribiri","Zumbi dos Palmares","Dom João Batista","Santa Rita","Ataíde","Primeiro de Maio",
 "Coqueiral de Itaparica","Praia de Itaparica","Vista da Penha","Jabaeté","Ponta da Fruta","Praia dos Recifes",
 "Morro da Lagoa","Interlagos","Itapuera da Barra"
]

out = {}
for b in bairros:
    q = urllib.parse.quote(f"{b}, Vila Velha, Espírito Santo, Brasil")
    url = f"https://nominatim.openstreetmap.org/search?q={q}&format=json&limit=1"
    try:
        req = urllib.request.Request(url, headers={"User-Agent":"alagamentos-vv-app/1.0"})
        data = json.loads(urllib.request.urlopen(req, timeout=15).read())
        if data:
            out[b] = {"lat": float(data[0]["lat"]), "lng": float(data[0]["lon"]), "name": data[0]["display_name"][:80]}
            print(f"OK  {b}: {out[b]['lat']}, {out[b]['lng']}")
        else:
            print(f"MISS {b}")
    except Exception as e:
        print(f"ERR {b}: {e}")
    time.sleep(1.1)

with open("geo.json","w") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print("saved", len(out))
