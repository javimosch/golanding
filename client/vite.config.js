import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'

  dotenv.config({path:'../.env'})

  const frontendEnvs= Object.keys(process.env).filter(key=>{
    return (process.env.FRONT_END_ENVS||"").split(',').includes(key)
  }).reduce((a,k)=>{
    a[k]=process.env[k]
    return a
  },{})

  console.log({mode,isProduction,frontendEnvs,NODE_ENV:process.env.NODE_ENV})

  return {
    plugins: [react({
      // Force development mode for React when not in production
      jsxRuntime: isProduction ? 'automatic' : 'classic',
      jsxDev: !isProduction,
    })],
    server: {
      proxy: {
        '/ackee': {
          target: 'https://ackee.admin.savoietech.fr',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ackee/, '')
        }
      }
    },
    define:{
      'process.env': frontendEnvs
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: 'main.jsx',
        output: {
          entryFileNames: 'client.min.js',
          format: 'iife',
          name: 'app'
        }
      },
      minify: isProduction,
      sourcemap: !isProduction
    }
  }
})
