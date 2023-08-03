# Serveur NodeJS : Charité & Blockchain

- Permet d'enregistrer les dons de donnateur en utilisant le principe de la Blockchain
- L'API REST répond aux  verbes `GET` et `POST`
- La sauvegarde des dons s'effectue dans le fichier `blockchain.json`
- Tous les traitements s'effectuent en asynchrone à travers des `Promises`.

## Description de l'API

* Le serveur écoute sur le port `3000`
* le Endpoint est `/blockchain`

### GET

Lister tous les Dons

```shell
curl --request GET 'http://localhost:3000/blockchain'
```

### POST

Créer un nouveau bloc. Sa composition est fourni en json :
`{
"nom": "Nom de la personne",
"somme": 1234
}`

L'identifiant du don est généré automatiquement au format uuid. La date (`timestamp`) est mise
au format `aaaammjj-hh:mm:ss` insérés à la réception du don. Une valeur de hachage est
calculée avec l'algorithme **sha256** à partir du bloc précédent. Pour le premier bloc,
la valeur `hash` est déterminée à partir de la variable `unSecret`.

```shell
curl --request POST 'http://localhost:3000/blockchain' --header 'Content-Type: application/json' --data-raw '{
   "nom": "Alan Turing",
   "somme": 4567
}'
```
L'enregistrement résultant pourrait ressemble à ceci :
`{
"id": "0b05ea1c-a17f-411a-9bb6-c31130b3e212",
"nom": "Alan Turing",
"don": 4567,
"date": "20230802-16:31:30",
"hash": "b28c94b2195c8ed259f0b415aaee3f39b0b2920a4537611499fa044956917a21"
}`

