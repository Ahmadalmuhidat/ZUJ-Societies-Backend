pipeline {
  agent any

  environment {
    DOCKER_IMAGE = "zuj-societies-backend"
    DOCKER_CONTAINER = "zuj-societies-backend"
    MONGO_URI = 'mongodb://34.29.161.87:27017/zuj_societies'
    JWT_SECRET = 'b9d4c4f4a13de41d9fe784e4f2107d5c8b8f2d2b3c56a6f73f396da7468b6c417c087ceae2142f8b6ba7e5da028581ba774b3c0c536dc8ff4e8e907f943f4a6e2'
    EMAIL_USER = 'ahmad.almuhidat@gmail.com'
    EMAIL_PASS = 'lgau oofs jhky eelv'
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

    stage('Push Docker Image') {
      steps {
        echo "Tagging and pushing Docker image to registry"
        sh """
          docker tag ${DOCKER_IMAGE}:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest
          docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest
        """
      }
    }

    stage('Stop and Remove Old Container') {
      steps {
        echo "Stopping old container if exists"
        sh """
          docker stop ${DOCKER_CONTAINER} || true
          docker rm ${DOCKER_CONTAINER} || true
        """
      }
    }

    stage('Run Container') {
      steps {
        echo "Running container ${DOCKER_CONTAINER} with environment variables..."
        sh """
          docker run -d --name ${DOCKER_CONTAINER} \
          -p 3000:3000 \
          -e MONGO_URI='${MONGO_URI}' \
          -e JWT_SECRET='${JWT_SECRET}' \
          -e EMAIL_USER='${EMAIL_USER}' \
          -e EMAIL_PASS='${EMAIL_PASS}' \
          ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest
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
