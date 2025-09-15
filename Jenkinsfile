pipeline {
  agent any

  environment {
    DOCKER_IMAGE = "zuj-societies-backend"
    DOCKER_CONTAINER = "zuj-societies-backend"
  }

  stages {

    stage('Checkout Code') {
      steps {
        echo "Checking out latest code from repository..."
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        echo "Building Docker image ${DOCKER_IMAGE}:latest..."
        sh """
          docker build -t ${DOCKER_IMAGE}:latest .
        """
      }
    }

    stage('Stop & Remove Existing Container') {
      steps {
        echo "Stopping old container if it exists..."
        sh """
          docker stop ${DOCKER_CONTAINER} || true
          docker rm ${DOCKER_CONTAINER} || true
        """
      }
    }

    stage('Run Container') {
      steps {
        echo "Running container ${DOCKER_CONTAINER}..."
        withCredentials([
          string(credentialsId: 'zuj-societies-jwt-secret', variable: 'JWT_SECRET'),
          string(credentialsId: 'zuj-societies-mongo-uri', variable: 'MONGO_URI'),
          string(credentialsId: 'zuj-societies-email-user', variable: 'EMAIL_USER'),
          string(credentialsId: 'zuj-societies-email-pass', variable: 'EMAIL_PASS')
        ]) {
          sh """
            docker run -d --name ${DOCKER_CONTAINER} \
              --restart unless-stopped \
              -p 4000:4000 \
              -e PORT=4000 \
              -e JWT_SECRET='${JWT_SECRET}' \
              -e MONGO_URI='${MONGO_URI}' \
              -e EMAIL_USER='${EMAIL_USER}' \
              -e EMAIL_PASS='${EMAIL_PASS}' \
              ${DOCKER_IMAGE}:latest
          """
        }
      }
    }
  }

  post {
    failure {
      echo 'Deployment failed.'
    }
    success {
      echo 'Deployment completed successfully.'
    }
  }
}
