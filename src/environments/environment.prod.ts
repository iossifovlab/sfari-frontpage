export const environment = {
  production: true,
  instances: {
    hg19: {
      apiPath: 'http://localhost:8000/api/v3',
      frontendPath: 'http://localhost123:4200',
    },
    hg38: {
      apiPath: 'http://localhost:8000/api/v3',
      frontendPath: 'http://localhost:4200',
    },
  },
  authPath: 'http://localhost:8000',
  oauthClientId: 'gpfjs-frontpage'
};
