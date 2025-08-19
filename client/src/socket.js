import { io } from 'socket.io-client'

// Singleton socket instance used across components
export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
  autoConnect: true,
})
