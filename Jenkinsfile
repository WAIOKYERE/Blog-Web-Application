//   pipeline {
//     agent any

//     environment {
//         IMAGE_NAME = 'blog-web-application-blog-app'
//         DOCKER_HOST = 'unix:///var/run/docker.sock'
//     }

//     stages {
   
//         stage('Install Dependencies') {
//             steps {
//                 sh 'npm install'
//             }
//         }

//         stage('Test') {
//             steps {
//                 sh 'npm test || echo "No test script defined"'
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 sh "docker build -t $IMAGE_NAME ."
//             }
//         }

//         stage('Push to DockerHub') {
//             when {
//                 branch 'main'
//             }
//             steps {
//                 withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
//                     sh '''
//                         echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
//                         docker tag $IMAGE_NAME $DOCKER_USER/$IMAGE_NAME:latest
//                         docker push $DOCKER_USER/$IMAGE_NAME:latest
//                     '''
//                 }
//             }
//         }

//         stage('Deploy (Optional)') {
//             steps {
//                 echo 'Deploy logic goes here (e.g., SSH to server or trigger remote script)'
//             }
//         }
//     }
// }




// pipeline {
//     agent any

//     environment {
//         IMAGE_NAME = 'blog-web-application-blog-app'
//         DOCKER_HOST = 'unix:///var/run/docker.sock'
//         // Add timestamp for unique tags in development
//         IMAGE_TAG = "${env.BRANCH_NAME == 'main' ? 'latest' : 'dev-' + env.BUILD_NUMBER}"
//     }

//     stages {
//         stage('Install Dependencies') {
//             steps {
//                 sh 'npm install'
//                 // Cache node_modules for faster builds
//                 stash includes: 'node_modules/', name: 'node-modules'
//             }
//         }

//         stage('Test') {
//             steps {
//                 sh 'npm test || echo "Tests failed - continuing pipeline"'
//                 // Add test coverage reporting if available
//                 // post always { junit 'reports/**/*.xml' }
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 unstash 'node-modules'  // Restore cached dependencies
//                 sh "docker build -t $IMAGE_NAME:$IMAGE_TAG ."
//                 // Clean up intermediate images
//                 sh 'docker image prune -f'
//             }
//         }

//         stage('Push to DockerHub') {
//             when {
//                 branch 'main'  // Only push to DockerHub from main branch
//             }
//             steps {
//                 withCredentials([usernamePassword(
//                     credentialsId: 'dockerhub-creds',
//                     usernameVariable: 'DOCKER_USER',
//                     passwordVariable: 'DOCKER_PASS'
//                 )]) {
//                     sh '''
//                         echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
//                         docker tag "$IMAGE_NAME:$IMAGE_TAG" "$DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG"
//                         docker push "$DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG"
//                         docker logout
//                     '''
//                 }
//             }
//         }

//         stage('Deploy') {
//             when {
//                 branch 'main'  // Only deploy from main branch
//             }
//             steps {
//                 script {
//                     // Example deployment - adjust for your infrastructure
//                     echo "Deploying $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG"
//                     // You could add actual deployment commands here, like:
//                     // - SSH to a server and pull/run the new image
//                     // - Trigger a Kubernetes rollout
//                     // - Update a Docker Swarm service
//                 }
//             }
//         }
//     }

//     post {
//         always {
//             echo "Pipeline completed - cleanup"
//             // Clean up workspace
//             cleanWs()
//         }
//         success {
//             echo "✅ Pipeline succeeded!"
//             // Optional: Send success notification
//         }
//         failure {
//             echo "❌ Pipeline failed!"
//             // Optional: Send failure notification
//         }
//     }
// }





pipeline {
    agent {
        docker {
            image 'node:18'  // Matches your Dockerfile
            args '-v /var/run/docker.sock:/var/run/docker.sock -v $HOME/.npm:/root/.npm'  // Docker-in-Docker + npm cache
        }
    }

    environment {
        IMAGE_NAME = 'blog-web-application-blog-app'
        IMAGE_TAG = "${env.BRANCH_NAME == 'main' ? 'latest' : 'dev-' + env.BUILD_NUMBER}"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm ci --prefer-offline'  // Clean install using package-lock.json
            }
        }

        stage('Test') {
            steps {
                sh 'npm test || echo "Tests failed - continuing pipeline"'
                // Uncomment if you have JUnit test reports:
                // post { always { junit 'reports/**/*.xml' } }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build -t $IMAGE_NAME:$IMAGE_TAG .
                    docker image prune -f  # Cleanup dangling images
                """
            }
        }

        stage('Push to DockerHub') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker tag $IMAGE_NAME:$IMAGE_TAG $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG
                        docker push $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG
                        docker logout
                    """
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Example deployment commands (adjust for your infrastructure):
                    echo "Deploying $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG"
                    // sh 'kubectl apply -f k8s/deployment.yaml'  // Kubernetes example
                    // sh 'ssh user@server "docker pull $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG && docker-compose up -d"'
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline completed - cleanup"
            // Optional: Add Slack/email notifications here
        }
        success {
            echo "✅ Pipeline succeeded!"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}










// pipeline {
//     agent any

//     stages {
//         stage('Build') {
//             steps {
//                 echo 'Building...'
//             }
//         }

//         stage('Test') {
//             steps {
//                 echo 'Testing...'
//             }
//         }

//         stage('Deploy') {
//             steps {
                
//                 echo 'Deploying...'
//             }
//         }
//     }
// }