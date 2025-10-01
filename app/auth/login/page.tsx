"use client"

import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"
import { Shield, Zap } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenue sur Email AI</h1>
          <p className="text-gray-600">Votre assistant email intelligent avec Gmail</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Réponses IA</h3>
              <p className="text-sm text-gray-600">Générez des réponses professionnelles en un clic</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sécurisé</h3>
              <p className="text-sm text-gray-600">Authentification Google sécurisée et fiable</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-500 font-medium">Connexion sécurisée</span>
            </div>
          </div>

          <div className="transform transition-all duration-200 hover:scale-[1.02]">
            <GoogleLoginButton />
          </div>
        </div>

        <div className="text-center space-y-3 pt-4 border-t border-gray-100">
          <p className="text-xs text-muted-foreground leading-relaxed">
            En vous connectant, vous acceptez nos{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              politique de confidentialité
            </a>
            .
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Données protégées par Google</span>
          </div>
        </div>
      </div>
    </div>
  )
}
