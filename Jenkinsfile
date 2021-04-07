pipeline {
    agent {
        docker {
            image 'node:14-alpine' 
        }
    }
    stages {
        stage('Build') { 
            steps {
                sh 'yarn' 
                sh 'yarn build:staging'
            }
        }
        stage('Archive') {
            steps {
                dir('archive') {
                    archiveArtifacts artifacts: '**'
                }
            }
        }
    }
}