'use client';

import React from 'react';
import { ArrowLeft, Shield, Plus } from 'lucide-react';
import Link from 'next/link';
import { SubirFirma } from '@/components/admin/SubirFirma';
import { ListaFirmasAdmin } from '@/components/admin/ListaFirmasAdmin';
import { useFirmas } from '@/hooks/UseFirmas';

export default function AdminPage() {
  const { firmas, loading, error, recargarFirmas } = useFirmas();

  // Contar todas las firmas de todas las categorías
  const totalFirmas = (firmas?.trabajador?.length || 0) + 
                      (firmas?.supervisor?.length || 0) + 
                      (firmas?.responsable?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">Fundamiga</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Volver</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Administración de Firmas
            </h1>
          </div>
          <p className="text-gray-600 mt-2 ml-0">Gestiona y controla las firmas autorizadas del sistema</p>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 p-16 text-center shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-50 animate-pulse"></div>
                <div className="relative w-full h-full border-4 border-gray-200 border-t-purple-600 border-r-blue-600 rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Cargando firmas...</p>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-300/50 rounded-2xl p-8 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 p-3 bg-red-500/10 rounded-xl">
                <span className="text-3xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 text-lg">Error al cargar</h3>
                <p className="text-red-700/80 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total de Firmas', value: totalFirmas, desc: 'Firmas en el sistema', color: 'from-purple-500 to-purple-600' },
                { label: 'Estado', value: 'Activo', desc: 'Sistema operativo', color: 'from-green-500 to-emerald-600' },
                { label: 'Última actualización', value: 'Hoy', desc: 'Cambios recientes', color: 'from-blue-500 to-cyan-600' }
              ].map((stat, idx) => (
                <div 
                  key={idx}
                  className="group relative bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-600 text-sm font-semibold">{stat.label}</p>
                      
                    </div>
                    <p className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-gray-500 text-xs mt-3">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Subir Firma - Takes 1 column */}
              <div className="lg:col-span-1">
                <div className="group bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="bg-gradient-to-br from-purple-600 via-purple-600 to-blue-600 px-6 py-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Plus size={20} className="text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-white">Nueva Firma</h2>
                    </div>
                  </div>
                  <div className="p-6 bg-white/50">
                    <SubirFirma onFirmaSubida={recargarFirmas} />
                  </div>
                </div>
              </div>

              {/* Lista de Firmas - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50 px-6 py-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900">Firmas Registradas</h2>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <ListaFirmasAdmin 
                      firmas={firmas} 
                      onFirmaEliminada={recargarFirmas} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}