# Ramla رملة Matcha

Boutique en ligne et système de gestion de commandes pour Ramla Matcha.  
L'application comprend le site vitrine/boutique, la gestion du panier, la collecte des e-mails (newsletter avec code promo -10 %), l'enregistrement des commandes (paiement à la livraison avec confirmation WhatsApp) et un tableau de bord administrateur sécurisé.

## Architecture du projet

```text
.
├── admin/
│   └── index.html             # Interface web du tableau de bord d'administration
├── config/
│   └── shop.json              # Configuration métier (produits, prix, frais de livraison, réseaux)
├── data/                      # Données persistantes locales (créé au premier lancement)
│   ├── orders.json            # Base des commandes clients enregistrées
│   └── subscribers.json       # Liste des e-mails inscrits et codes promo générés
├── public/                    # Fichiers statiques servis au public
│   ├── css/style.css          # Feuilles de styles du site
│   ├── js/
│   │   ├── app.js             # Logique applicative front-end (panier, validation)
│   │   └── i18n.js            # Traductions et internationalisation (AR/EN/FR)
│   ├── img/                   # Visuels, logos et photographies
│   ├── index.html             # Page d'accueil vitrine
│   ├── shop.html              # Catalogue de vente
│   ├── accessories.html       # Catalogue des accessoires
│   ├── cart.html              # Vue du panier client
│   ├── checkout.html          # Formulaire de commande et sélection de wilaya
│   ├── thanks.html            # Confirmation de validation de commande
│   └── story.html             # Présentation de la marque et histoire
├── server.js                  # Serveur d'API Express, routage, envois d'e-mails et sécurité
├── wilayas.js                 # Référentiel des 58 wilayas d'Algérie et tarification
├── Dockerfile                 # Recette de conteneurisation de l'application
├── docker-compose.yml         # Définition du service et labels Traefik pour la production
├── flake.nix / flake.lock     # Environnement de développement reproductible (Nix)
├── package.json               # Dépendances et scripts Node.js
└── DEPLOY.txt                 # Notes internes d'infrastructure
```

## ⚙️ Configuration de l'environnement (`.env`)

Créez un fichier `.env` à la racine du projet (sur votre machine locale ou sur le serveur). Il ne doit jamais être commité dans Git :

```bash
cp .env.example .env
```

```ini
SITE_URL=https://ramla-matcha.com

# Administration
ADMIN_PASSWORD=changez_ce_mot_de_passe_robuste

# Destinataire des notifications de nouvelles commandes
OWNER_EMAIL=contact@ramla-matcha.com

# Configuration SMTP (envoi des e-mails transactionnels et codes promo)
SMTP_HOST=smtp.exemple.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@ramla-matcha.com
SMTP_PASS=mot_de_passe_smtp
MAIL_FROM="contact@ramla-matcha.com"
```

Note : Si les identifiants SMTP ne sont pas renseignés, le serveur bascule automatiquement en mode secours et affiche les codes de réduction directement à l'écran pour permettre les tests.

## Développement local

Prérequis :

- Node.js (version 26+)
- `npm` ou environnement `nix develop`
- Docker et Docker Compose

### Démarrage

```bash
# 1. Installation des dépendances
npm install
# 2. Lancement du serveur en local
npm start
```

L'application est accessible à l'adresse `http://localhost:3000`.

## Maintenance des dépendances npm

Pour maintenir les modules externes à jour et corriger d'éventuelles vulnérabilités de sécurité :

```bash
# Vérifier les dépendances obsolètes
npm outdated

# Mettre à jour les dépendances respectant les plages semver
npm update

# Mettre à jour des packages majeurs (nécessite npm-check-updates)
npx npm-check-updates -u && npm install

# Analyser et corriger les failles connues
npm audit
npm audit fix
```

## Déploiement & CI/CD

Le déploiement est entièrement automatisé via GitHub Actions lors de chaque merge ou push sur la branche `main` :

- L'image Docker est construite et envoyée sur GitHub Container Registry (`ghcr.io`).
- Le runner se connecte au serveur distant en SSH via un tunnel sécurisé Cloudflare Access (`cloudflared`).
- Le serveur exécute un `docker compose pull` et relance le service sans interruption.

### Fichiers exclus du dépôt et requis sur le serveur

Pour des raisons évidentes de sécurité et de persistance, certains fichiers ne sont pas transférés par Git ni par l'image Docker et doivent exister manuellement sur l'hôte distant (`~/containers/ramla-matcha/`) :

- `.env` : Contient les mots de passe et clés secrètes SMTP/Admin.
- `docker-compose.yml` : Fichier déclarant le service, le réseau inverse Traefik et les montages de volumes.
- `config/shop.json` : Permet d'ajuster les prix, produits et frais de port à chaud sans refaire de build d'image Docker.
- `data/` : Dossier contenant les bases JSON `orders.json` et `subscribers.json`.

## Commandes utiles

- Suivre les logs en temps réel : `docker logs -f ramla-matcha`
- Entrer dans le conteneur : `docker exec -it ramla-matcha sh`
- Inspecter les variables d'environnement actives : `docker exec -it ramla-matcha env`
- Redémarrer le service : `docker restart ramla-matcha`

## Gestion des données et sauvegardes

Les données sont persistées sur l'hôte via les montages définis dans `docker-compose.yml` :

```yaml
volumes:
  - ./data:/data # Commandes + abonnées conservées entre les redémarrages
  - ./config:/app/config:ro # Modifier prix / frais de livraison sans reconstruire l'image
```

### Sauvegarde des commandes et abonnées

Pour créer une archive locale horodatée :

```bash
# Créer une archive horodatée du dossier de données
tar -czvf backup-ramla-$(date +%F).tar.gz ./data

# Télécharger la sauvegarde depuis le serveur vers sa machine locale
scp user@serveur:~/containers/ramla-matcha/backup-ramla-*.tar.gz ./backups/
```

### Restauration d'une sauvegarde

Pour réinjecter une sauvegarde précédente en cas d'incident, il est impératif de couper temporairement l'écriture par le conteneur pour éviter toute corruption des fichiers JSON :

```bash
# Stopper le conteneur applicatif
docker compose stop ramla-matcha

# Restaurer l'archive ciblée
tar -xzvf backup-ramla-<date>.tar.gz -C .

# Relancer le service
docker compose up -d
```
