import { create } from 'zustand'

export const useUserStore = create((set) => ({
  user : null,
  setUser: () => set(state => ({ user : user }))
}))