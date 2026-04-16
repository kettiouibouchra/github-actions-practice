FROM node:18-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# On installe les dépendances d'abord (optimisation)
COPY package*.json ./
RUN npm install

# On copie le reste du code (dont app.js et visits.json)
COPY . .

# Port utilisé par ton app
EXPOSE 3000

CMD ["npm", "start"]