"use client"

import { useContext } from "react"
import { UserContext } from "../common/UserContext"

export const useUserProfile = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error("useUserProfile must be used within a UserProvider")
  }

  const { user, loading, error, refreshProfile, fetchUserProfile } = context

  return {
    user,
    loading,
    error,
    refreshProfile: refreshProfile || fetchUserProfile,
  }
}
