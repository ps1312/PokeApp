module.exports = {
  apps: [{
    name: 'pokedex-app',
    script: './app.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-54-167-214-209.compute-1.amazonaws.com',
      key: '~/.ssh/tutorial-2.pem',
      ref: 'origin/master',
      repo: 'git@github.com:ps1312/teste_mobiclub.git',
      path: '/home/ubuntu/teste_backend',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}