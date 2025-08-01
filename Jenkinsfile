pipeline {
  agent any

  environment {
    DOCKER_IMAGE = "zuj-societies-backend"
    DOCKER_CONTAINER = "zuj-societies-backend"
    MONGO_URI="mongodb://localhost:27017/zuj_societies"
    EMAIL_USER="ahmad.almuhidat@gmail.com"
    EMAIL_PASS="lgau oofs jhky eelv"
    JWT_SECRET = credentials('jwt-secret-id') // Jenkins credentials (type: Secret Text)
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        echo "Building Docker image ${DOCKER_IMAGE}:latest"
        sh "docker build -t ${DOCKER_IMAGE}:latest ."
      }
    }

    stage('Stop and Remove Old Container') {
      steps {
        echo "Stopping old container if it exists"
        sh """
          docker stop ${DOCKER_CONTAINER} || true
          docker rm ${DOCKER_CONTAINER} || true
        """
      }
    }

    stage('Run Container') {
      steps {
        echo "Running container ${DOCKER_CONTAINER}..."
        sh """
          docker run -d \\
            --name ${DOCKER_CONTAINER} \\
            -p 4000:4000 \\
            -e JWT_SECRET=${JWT_SECRET} \\
            -e MONGO_URI=${MONGO_URI} \\
            -e EMAIL_USER=${EMAIL_USER} \\
            -e EMAIL_PASS=${EMAIL_PASS} \\
            ${DOCKER_IMAGE}:latest
        """
      }
    }
  }

  post {
    success {
      echo 'Deployment completed successfully!'
    }
    failure {
      echo 'Deployment failed.'
    }
  }
}
