# 📚 Carnet de Maintenance PAC

<div align="center">
  <img src="https://via.placeholder.com/400x200?text=Carnet+de+Maintenance+PAC" alt="Logo du projet" width="400" />
  <p><em>Solution numérique pour la gestion et le suivi de maintenance des Pompes à Chaleur</em></p>
</div>

## 📋 Présentation

Le **Carnet de Maintenance PAC** est une application web moderne conçue pour faciliter le suivi et la gestion de l'entretien des Pompes à Chaleur (PAC) dans les bâtiments résidentiels ou commerciaux. Cette solution interactive permet aux techniciens et gestionnaires de bâtiments de documenter l'état des installations, planifier la maintenance préventive et garder une trace détaillée des interventions effectuées.

## ✨ Fonctionnalités principales

- **📊 Vue d'ensemble** - Tableau de bord avec statistiques en temps réel sur l'état du parc de PAC
- **🏢 Navigation par étage** - Organisation des PAC par étage pour une gestion spatiale intuitive
- **🔍 Recherche avancée** - Filtrage par état, étage, ou identifiant de machine
- **📝 Historique des interventions** - Suivi chronologique de toutes les opérations de maintenance
- **🚨 Gestion des états** - Classification des machines (Fonctionnel, Hors Service, Non vérifié)
- **📅 Planification** - Organisation des opérations de maintenance préventive
- **🧰 Fiches d'intervention** - Documentation détaillée des opérations techniques

## 🛠️ Technologies utilisées

- **React.js** - Bibliothèque JavaScript pour la construction d'interfaces utilisateur
- **Tailwind CSS** - Framework CSS utilitaire pour un design moderne et réactif
- **Lucide React** - Ensemble d'icônes SVG pour une interface visuelle claire

## 🚀 Installation et démarrage

```bash
# Cloner le dépôt
git clone https://github.com/DaMolks/carnet-maintenance-pac.git

# Accéder au répertoire du projet
cd carnet-maintenance-pac

# Installer les dépendances
npm install

# Démarrer l'application en mode développement
npm start
```

L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000).

### Démarrer le serveur backend

```bash
cd server
npm install
npm start
```

Le serveur répond par défaut sur [http://localhost:3001](http://localhost:3001).

Il initialise une base SQLite avec les données de `server/data/machines.json`.

#### API disponible

- `GET /api/machines` – liste toutes les machines avec leur historique d'interventions
- `GET /api/machines/:id` – détail d'une machine par identifiant

## 📱 Captures d'écran

<div align="center">
  <img src="https://via.placeholder.com/800x400?text=Dashboard" alt="Dashboard" width="800" />
  <p><em>Vue principale du tableau de bord</em></p>
  
  <img src="https://via.placeholder.com/800x400?text=Details+Machine" alt="Détails d'une machine" width="800" />
  <p><em>Fiche détaillée d'une machine</em></p>
</div>

## 🗃️ Structure du projet

```
carnet-maintenance-pac/
├── public/                # Fichiers accessibles publiquement
├── server/                # Serveur Express pour l'API
├── src/                   # Code source de l'application
│   ├── components/        # Composants React réutilisables
│   ├── data/              # Données et structures de données
│   ├── utils/             # Fonctions utilitaires
│   ├── App.js             # Composant principal de l'application
│   └── index.js           # Point d'entrée de l'application
└── package.json           # Configuration des dépendances
```

## 🔧 Personnalisation

Le carnet de maintenance est hautement personnalisable pour s'adapter à différentes configurations de bâtiments et types de PAC. Vous pouvez facilement modifier :

- Les étages et leur organisation
- Les types d'interventions possibles
- Les statuts des machines
- Les champs dans les fiches d'intervention

## 📈 Développements futurs

- Intégration avec des systèmes de monitoring en temps réel
- Ajout d'un système de notifications par email ou SMS
- Application mobile pour les techniciens sur le terrain
- Génération de rapports et statistiques avancées
- Mode hors-ligne pour les zones avec connectivité limitée

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Contributeurs

- [Votre Nom](https://github.com/DaMolks) - Développeur principal

---

<div align="center">
  <p>Développé avec ❤️ pour simplifier la gestion des systèmes de chauffage et climatisation</p>
</div>
