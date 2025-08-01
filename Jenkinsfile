pipeline {
  agent any

  environment {
    DOCKER_IMAGE = "zuj-societies-backend"
    DOCKER_CONTAINER = "zuj-societies-backend"
    MONGO_URI = "mongodb://localhost:27017/zuj_societies"
  }

  stages {
    stage('Stop & Remove Existing Container') {
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
        withCredentials([
          string(credentialsId: 'zuj-societies-jwt-secret', variable: 'JWT_SECRET'),
          string(credentialsId: 'email-user', variable: 'EMAIL_USER'),
          string(credentialsId: 'email-pass', variable: 'EMAIL_PASS')
        ]) {
          sh '''
            docker run -d --name ${DOCKER_CONTAINER} \
              -p 4000:4000 \
              -e JWT_SECRET="${JWT_SECRET}" \
              -e MONGO_URI="${MONGO_URI}" \
              -e EMAIL_USER="${EMAIL_USER}" \
              -e EMAIL_PASS="${EMAIL_PASS}" \
              ${DOCKER_IMAGE}:latest
          '''
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
