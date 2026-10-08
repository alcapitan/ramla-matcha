# Ramla رملة Matcha — site e-commerce

Site en anglais / arabe (bouton **EN | ع**), paiement à la livraison, tout dans **une seule image Docker**.

## Ce que fait le site

| Page | Contenu |
|---|---|
| `/` Accueil | Hero, matcha, rituel, histoire, accessoires |
| `/shop.html` | La boîte de matcha 30 g avec galerie de 9 photos |
| `/story.html` | Qui sommes-nous — le parcours de Ramla |
| `/accessories.html` | Fouet bambou, tote bag, casquette |
| `/cart.html` → `/checkout.html` | Panier puis formulaire : nom, prénom, téléphone, wilaya (58), commune, adresse, domicile ou stop desk |
| `/admin` | **Toi uniquement** : liste des commandes + bouton WhatsApp pré-rempli |

**Popup -15 %** : à la première visite, la cliente entre son e-mail → elle reçoit un code unique `RAMLA15-XXXXX` (utilisable une seule fois). Elle peut fermer avec la croix.

**Commande** : pas de paiement en ligne. Quand elle confirme, la commande est enregistrée, tu reçois un e-mail, et sur `/admin` tu cliques **WhatsApp** : le message de confirmation est déjà écrit (dans sa langue).

## Configuration

1. `cp .env.example .env` puis remplis : mot de passe admin, ton e-mail, SMTP.
   - Gmail : active la validation en 2 étapes → crée un « mot de passe d'application » → mets-le dans `SMTP_PASS`.
   - Sans SMTP, le site marche quand même : le code -15 % s'affiche à l'écran au lieu d'être envoyé.
2. Prix et frais de livraison : `config/shop.json` (en DZD).
   - `delivery.home` / `delivery.desk` = tarif par défaut ; `overrides` = tarif par wilaya (ex. `"16"` = Alger).
3. Textes : `public/js/i18n.js` (anglais + arabe). Photos : `public/img/`.

## Docker — construire, exporter, déployer (sans registre)

### 1. Sur ton ordinateur : construire l'image

```bash
cd ramla-matcha
docker build -t ramla-matcha:1.0 .
```

Test local (optionnel) :
```bash
cp .env.example .env        # puis édite-le
docker compose up -d        # → http://localhost
docker compose down
```

### 2. Exporter l'image en archive

```bash
docker save ramla-matcha:1.0 | gzip > ramla-matcha-1.0.tar.gz
```

### 3. Envoyer sur le serveur (SSH)

```bash
ssh user@IP_SERVEUR "mkdir -p ~/ramla"
scp ramla-matcha-1.0.tar.gz docker-compose.yml .env user@IP_SERVEUR:~/ramla/
```
(Sans SSH : copie ces 3 fichiers par clé USB / SFTP / FileZilla dans un dossier du serveur.)

### 4. Sur le serveur : charger et lancer

```bash
ssh user@IP_SERVEUR
cd ~/ramla
gunzip -c ramla-matcha-1.0.tar.gz | docker load
docker compose up -d --no-build
docker compose logs -f        # vérifier (Ctrl+C pour quitter)
```

Le site répond sur le port 80. Admin : `http://IP_SERVEUR/admin` (n'importe quel identifiant + `ADMIN_PASSWORD`).

### Mettre à jour plus tard

Change la version (`1.1`) dans `docker-compose.yml` et dans les commandes, refais les étapes 1 → 4. Les commandes et abonnées sont dans le volume `ramla-data` : elles sont conservées.

Sauvegarde des données :
```bash
docker cp ramla-matcha:/data ./sauvegarde-$(date +%F)
```

### HTTPS (nom de domaine)

Pour `https://`, place un reverse proxy devant (ex. Caddy : `ramlamatcha.com { reverse_proxy localhost:8080 }`) et change le port dans `docker-compose.yml` en `"8080:3000"`.
