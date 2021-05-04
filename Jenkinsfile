node {
	git 'https://github.com/open-imcore/imcore.react'
	
	def build_env

	stage("Setup Docker") {
		build_env = docker.build('imcore_react:build', '.')
	}

	build_env.inside("-u root") {
		stage("Build Staging") {
			sh 'cd /tmp/imcore && yarn build:staging'
		}
		
		stage("Archive Artifacts") {
			sh '''
			cd /tmp/imcore
            rm -rf ${WORKSPACE}/build
            mv build ${WORKSPACE}/build
			'''
		}
	}
    
    dir('build') {
        archiveArtifacts artifacts: '**'
    }

    dir('Push to Staging') {
        sh '''
        ssh host "rm -rf ~/www-staging/imcore.react"
        scp -r build host:~/www-staging/imcore.react
        '''
    }
}