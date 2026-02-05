'use client';

import React, { useState } from 'react';
import { Plus, FileText, Shield, TrendingUp, Download } from 'lucide-react';
import { FormularioRegistro } from '@/components/formRegis';
import { ListaRegistros } from '@/components/ListaRegistro';
import { InformeConPanelEdicion } from '@/components/InformeConPanelEdicion';
import { BotonAccesoAdmin } from '@/components/BotonAccesoAdmin';
import { useRegistroDiario } from '@/hooks/useRegistroDiario';
import { useFirmas } from '@/hooks/UseFirmas';
import { RegistroDiario, ItemTabla, ItemFactura } from '@/types';

interface InformeData {
  id: string;
  registros: RegistroDiario[];
  itemsFacturas: ItemFactura[];
  fechaCreacion: Date;
}

export default function SistemaControlDonaciones() {
  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [mostrarMultiplesInformes, setMostrarMultiplesInformes] = useState(false);
  const [informes, setInformes] = useState<InformeData[]>([]);
  const [informeActual, setInformeActual] = useState<InformeData | null>(null);
  
  const {
    registros,
    registroActual,
    itemsFacturas,
    handleInputChange,
    handleDonacionChange,
    handleFacturaChange,
    handleItemsFacturasChange,
    handleFirmaChange,
    agregarRegistro,
    eliminarRegistro,
    reiniciarFormulario
  } = useRegistroDiario();

  const { firmas } = useFirmas();

  const handleAgregarRegistro = () => {
    const exito = agregarRegistro();
    if (!exito) {
      alert('Por favor completa todos los campos obligatorios');
    }
  };

  const handleGenerarInforme = () => {
    if (registros.length === 0 && !registroActual.ubicacion) {
      alert('Debes agregar al menos un registro');
      return;
    }

    // Incluir el registro actual si tiene datos
    let todosLosRegistros = [...registros];
    if (registroActual.ubicacion && registroActual.donaciones.valor > 0) {
      agregarRegistro();
      todosLosRegistros = [...registros, registroActual];
    }

    // Crear un nuevo informe
    const nuevoInforme: InformeData = {
      id: Date.now().toString(),
      registros: todosLosRegistros,
      itemsFacturas: itemsFacturas,
      fechaCreacion: new Date()
    };

    setInformes([...informes, nuevoInforme]);
    setInformeActual(nuevoInforme);
    setMostrarInforme(true);
  };

  const handleNuevoInforme = () => {
    reiniciarFormulario();
    setMostrarInforme(false);
    setInformeActual(null);
  };

  const handleVerInforme = (informe: InformeData) => {
    setInformeActual(informe);
    setMostrarInforme(true);
  };

  const handleEliminarInforme = (id: string) => {
    setInformes(informes.filter(inf => inf.id !== id));
    if (informeActual?.id === id) {
      setMostrarInforme(false);
      setInformeActual(null);
    }
  };

  const handleActualizarRegistrosInforme = (
    registrosActualizados: RegistroDiario[], 
    itemsActualizados: ItemTabla[],
    itemsFacturasActualizados: ItemFactura[]
  ) => {
    if (!informeActual) return;
    
    const informeActualizado = {
      ...informeActual,
      registros: registrosActualizados,
      itemsFacturas: itemsFacturasActualizados
    };
    
    setInformeActual(informeActualizado);
    setInformes(informes.map(inf => 
      inf.id === informeActual.id ? informeActualizado : inf
    ));
  };

  const handleDescargarPDFMultiple = () => {
    if (informes.length === 0) {
      alert('No hay informes para descargar');
      return;
    }
    setMostrarMultiplesInformes(true);
    
    // Ejecutar print después de que se renderice
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (mostrarMultiplesInformes) {
    return (
      <div>
        {informes.map((informe, idx) => (
          <div 
            key={informe.id}
            style={{
              pageBreakAfter: idx < informes.length - 1 ? 'always' : 'avoid'
            }}
          >
            <InformeConPanelEdicion 
              registros={informe.registros}
              itemsFacturas={informe.itemsFacturas}
              firmasExternas={firmas}
              onNuevoInforme={() => {
                setMostrarMultiplesInformes(false);
                setMostrarInforme(false);
              }}
              onActualizarRegistros={() => {}}
            />
          </div>
        ))}
        <button
          onClick={() => setMostrarMultiplesInformes(false)}
          className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg print:hidden"
        >
          Volver
        </button>
      </div>
    );
  }

  if (mostrarInforme && informeActual) {
    return (
      <>
        <InformeConPanelEdicion 
          registros={informeActual.registros}
          itemsFacturas={informeActual.itemsFacturas}
          firmasExternas={firmas}
          onNuevoInforme={handleNuevoInforme}
          onActualizarRegistros={handleActualizarRegistrosInforme}
        />
        <BotonAccesoAdmin />
      </>
    );
  }

  const totalRegistros = registros.length;
  const totalDonaciones = registros.reduce((sum, reg) => sum + reg.donaciones.valor, 0);

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
              <p className="text-xs text-gray-500">Control de Donaciones</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100">
              <TrendingUp size={16} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">{totalRegistros} registros</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Control Diario de Donaciones
            </h1>
          </div>
          <p className="text-gray-600 mt-2">Registra y gestiona las donaciones del día</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="group relative bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 text-sm font-semibold">Total de Registros</p>
                
              </div>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-600">
                {totalRegistros}
              </p>
              <p className="text-gray-500 text-xs mt-3">Registros hoy</p>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 text-sm font-semibold">Total Donaciones</p>
                
              </div>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
                ${totalDonaciones.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-3">Monto acumulado</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario - Takes 2 columns */}
          <div className="lg:col-span-3">
            <div className="group bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-600 via-purple-600 to-blue-600 px-6 py-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Plus size={20} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Nuevo Registro</h2>
                </div>
              </div>
              <div className="p-6 bg-white/50">
                <FormularioRegistro
                  registroActual={registroActual}
                  itemsFacturas={itemsFacturas}
                  onInputChange={handleInputChange}
                  onDonacionChange={handleDonacionChange}
                  onFacturaChange={handleFacturaChange}
                  onItemsFacturasChange={handleItemsFacturasChange}
                  onFirmaChange={handleFirmaChange}
                />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAgregarRegistro}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition-all duration-200"
                  >
                    <Plus size={20} />
                    Agregar Registro
                  </button>

                  <button
                    onClick={handleGenerarInforme}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-800 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all duration-200"
                  >
                    <FileText size={20} />
                    Generar Informe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Registros */}
          {registros.length > 0 && (
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white">Registros Agregados</h3>
                </div>
                <div className="p-6">
                  <ListaRegistros
                    registros={registros}
                    onEliminar={eliminarRegistro}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Informes Generados */}
          {informes.length > 0 && (
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-br from-amber-600 to-orange-600 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Informes Generados ({informes.length})</h3>
                  <button
                    onClick={handleDescargarPDFMultiple}
                    className="bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Descargar Todos
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {informes.map((informe) => (
                      <div key={informe.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              Informe #{informes.indexOf(informe) + 1}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {informe.fechaCreacion.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                          <p><span className="font-semibold">Registros:</span> {informe.registros.length}</p>
                          <p><span className="font-semibold">Facturas:</span> {informe.itemsFacturas.length}</p>
                          <p><span className="font-semibold">Total:</span> $
                            {informe.registros.reduce((sum, reg) => sum + reg.donaciones.valor, 0).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerInforme(informe)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleEliminarInforme(informe.id)}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante para acceder al panel admin */}
      <BotonAccesoAdmin />
    </div>
  );
}