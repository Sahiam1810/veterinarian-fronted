import { useState } from 'react'
import { BrandLogo } from '@/global/components'

interface PoliticaTratamientoDatosPageProps {
  onGoToLogin?: () => void
}

export function PoliticaTratamientoDatosPage({
  onGoToLogin,
}: PoliticaTratamientoDatosPageProps) {
  const [activeSection, setActiveSection] = useState<string>('responsable')

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleLoginClick = (e: React.MouseEvent) => {
    if (onGoToLogin) {
      e.preventDefault()
      onGoToLogin()
    }
  }

  return (
    <div className="h-screen w-full overflow-y-auto bg-[var(--color-bone,#faf5ec)] text-[var(--color-slate,#334155)] selection:bg-[#234e46]/20 selection:text-[#234e46]">
      {/* Barra de navegación superior fija / glassmorphism */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#faf5ec]/90 border-b border-[#e8dccf] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-xs border border-[#e8dccf]">
              <BrandLogo
                mark="principal"
                variant="transparent"
                alt="Huellitas"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base sm:text-lg text-[var(--color-brand,#234e46)] tracking-tight">
                  Huellitas Veterinaria
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#e8efea] text-[var(--color-brand,#234e46)] border border-[#658e83]/20">
                  Ley 1581 de 2012
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-placeholder,#9aa8a2)] hidden sm:block">
                Política de Tratamiento y Privacidad de Datos
              </p>
            </div>
          </div>

          {/* Acciones del encabezado */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/politica-tratamiento-datos.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="politica-tratamiento-datos-huellitas.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-[var(--color-brand,#234e46)] bg-white/80 hover:bg-white border border-[#e8dccf] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="Descargar versión PDF oficial"
            >
              <DownloadIcon className="w-4 h-4 text-[var(--color-brand,#234e46)]" />
              <span className="hidden sm:inline">Descargar</span> PDF
            </a>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-[var(--color-slate,#334155)] bg-white/80 hover:bg-white border border-[#e8dccf] shadow-2xs transition-all cursor-pointer"
              title="Imprimir documento"
            >
              <PrinterIcon className="w-4 h-4 text-[#658e83]" />
              <span>Imprimir</span>
            </button>

            <a
              href="/"
              onClick={handleLoginClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white bg-[var(--color-brand,#234e46)] hover:bg-[var(--color-brand-hover,#1b3e37)] shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-white/90" />
              <span>Acceso Staff</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner Informativo */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f6ede0] via-[#faf5ec] to-[#faf5ec] border-b border-[#e8dccf]/60 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#fbece8] text-[var(--color-terracotta,#c86d51)] border border-[#c86d51]/20 mb-4 shadow-2xs">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Documento Público Oficial • Habeas Data</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--color-brand,#234e46)] tracking-tight leading-tight">
            Política de Tratamiento de Datos Personales
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[var(--color-charcoal,#2d3748)]/80 max-w-2xl mx-auto leading-relaxed">
            En <strong>Clínica Veterinaria Huellitas</strong> protegemos la privacidad y garantizamos el tratamiento seguro y transparente de los datos personales de nuestros pacientes, clientes y familias, en cumplimiento de la normatividad colombiana.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-[#658e83]">
            <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-md border border-[#e8dccf]">
              <CalendarIcon className="w-3.5 h-3.5" />
              Última actualización: Septiembre 2026
            </span>
            <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-md border border-[#e8dccf]">
              <CheckBadgeIcon className="w-3.5 h-3.5" />
              Ley 1581 de 2012 y Dec. 1377 de 2013
            </span>
            <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-md border border-[#e8dccf]">
              <LockIcon className="w-3.5 h-3.5" />
              Tratamiento confidencial
            </span>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#234e46]/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-[#c86d51]/5 blur-3xl pointer-events-none" />
      </section>

      {/* Contenido Principal */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Navegación rápida por secciones */}
        <nav
          aria-label="Índice de la política"
          className="mb-8 p-3 rounded-xl bg-white/80 border border-[#e8dccf] shadow-2xs overflow-x-auto flex items-center gap-2 text-xs scrollbar-none"
        >
          <span className="font-semibold text-[var(--color-brand,#234e46)] px-2 whitespace-nowrap">
            Secciones:
          </span>
          {[
            { id: 'responsable', label: '1. Responsable' },
            { id: 'marco-legal', label: '2. Marco Legal' },
            { id: 'finalidades', label: '3. Finalidades' },
            { id: 'datos-recolectados', label: '4. Datos Recolectados' },
            { id: 'derechos', label: '5. Derechos Titular' },
            { id: 'seguridad', label: '6. Seguridad' },
            { id: 'procedimiento-pqr', label: '7. Ejercicio y PQR' },
            { id: 'vigencia', label: '8. Vigencia' },
          ].map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-[var(--color-brand,#234e46)] text-white shadow-2xs'
                  : 'text-[var(--color-slate,#334155)] hover:bg-[#faf5ec] hover:text-[var(--color-brand,#234e46)]'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </nav>

        {/* Tarjetas resumen en grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-4 rounded-xl bg-white border border-[#e8dccf] shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[#e8efea] text-[var(--color-brand,#234e46)] flex items-center justify-center mb-2">
              <StethoscopeIcon className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-[var(--color-brand,#234e46)]">Atención Veterinaria</h2>
            <p className="text-xs text-[var(--color-slate,#334155)]/80 mt-1 leading-relaxed">
              Tus datos permiten gestionar el historial clínico, citas médicas, recordatorios de vacunas y urgencias de tu mascota.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#e8dccf] shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[#fbf1e6] text-[var(--color-ochre,#e4a67a)] flex items-center justify-center mb-2">
              <MessageIcon className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-[var(--color-brand,#234e46)]">Asistente Virtual</h2>
            <p className="text-xs text-[var(--color-slate,#334155)]/80 mt-1 leading-relaxed">
              El chatbot y canales de mensajería asocian tu identidad para consultar citas y dar soporte inmediato.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#e8dccf] shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[#fbece8] text-[var(--color-terracotta,#c86d51)] flex items-center justify-center mb-2">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-[var(--color-brand,#234e46)]">Habeas Data</h2>
            <p className="text-xs text-[var(--color-slate,#334155)]/80 mt-1 leading-relaxed">
              Puedes conocer, corregir, actualizar o solicitar la supresión de tus datos en cualquier momento.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#e8dccf] shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[#e8efea] text-[var(--color-brand,#234e46)] flex items-center justify-center mb-2">
              <LockIcon className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-[var(--color-brand,#234e46)]">Cero Comercialización</h2>
            <p className="text-xs text-[var(--color-slate,#334155)]/80 mt-1 leading-relaxed">
              No compartimos, vendemos ni cedemos tu información a terceros para fines publicitarios ajenos a Huellitas.
            </p>
          </div>
        </div>

        {/* Artículos de la Política */}
        <div className="space-y-8 text-sm leading-relaxed text-[var(--color-charcoal,#2d3748)]">
          {/* 1. Responsable */}
          <section id="responsable" className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8dccf] shadow-2xs scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-[#e8efea] text-[var(--color-brand,#234e46)] flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-brand,#234e46)]">
                Identificación del Responsable del Tratamiento
              </h2>
            </div>
            <p className="mb-4">
              La <strong>Clínica Veterinaria Huellitas</strong>, domiciliada en Colombia, actúa en calidad de Responsable del Tratamiento de los datos personales suministrados por los usuarios, clientes, propietarios o tenedores de animales de compañía a través de sus canales físicos y digitales (sitio web, plataforma clínica, chatbot y líneas de mensajería).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#faf5ec] border border-[#e8dccf] text-xs">
              <div>
                <span className="font-semibold text-[var(--color-brand,#234e46)]">Razón Social:</span> Clínica Veterinaria Huellitas
              </div>
              <div>
                <span className="font-semibold text-[var(--color-brand,#234e46)]">NIT:</span> 901.458.789-3
              </div>
              <div>
                <span className="font-semibold text-[var(--color-brand,#234e46)]">Correo oficial Habeas Data:</span>{' '}
                <a href="mailto:privacidad@huellitasveterinaria.com" className="text-[var(--color-brand,#234e46)] underline font-medium">
                  privacidad@huellitasveterinaria.com
                </a>
              </div>
              <div>
                <span className="font-semibold text-[var(--color-brand,#234e46)]">Canal telefónico / WhatsApp:</span> (+57) 300 000 0000
              </div>
            </div>
          </section>

          {/* 2. Marco Legal */}
          <section id="marco-legal" className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8dccf] shadow-2xs scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-[#e8efea] text-[var(--color-brand,#234e46)] flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-brand,#234e46)]">
                Marco Legal y Principios Rectores
              </h2>
            </div>
            <p className="mb-3">
              La presente política se rige de conformidad con el artículo 15 de la Constitución Política de Colombia, la <strong>Ley Estatutaria 1581 de 2012</strong>, el <strong>Decreto Reglamentario 1377 de 2013</strong> (incorporado en el Decreto Único 1074 de 2015) y demás normas que las modifiquen, adicionen o reglamenten.
            </p>
            <p className="mb-3">
              En el tratamiento de la información se aplican estrictamente los principios de:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--color-slate,#334155)]">
              <li><strong>Legalidad:</strong> Tratamiento ajustado a las leyes colombianas aplicables.</li>
              <li><strong>Finalidad:</strong> Los datos se recopilan para un propósito legítimo y comunicado con claridad.</li>
              <li><strong>Libertad:</strong> El tratamiento solo se ejerce con consentimiento previo, expreso e informado del titular.</li>
              <li><strong>Veracidad o Calidad:</strong> La información debe ser veraz, completa, exacta, actualizada y comprensible.</li>
              <li><strong>Transparencia:</strong> Garantía de obtener en cualquier momento información sobre la existencia de datos relativos al titular.</li>
              <li><strong>Seguridad y Confidencialidad:</strong> Medidas técnicas y humanas para resguardar la información contra adulteración, pérdida o acceso no autorizado.</li>
            </ul>
          </section>

          {/* 3. Finalidades */}
          <section id="finalidades" className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8dccf] shadow-2xs scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-[#e8efea] text-[var(--color-brand,#234e46)] flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-brand,#234e46)]">
                Finalidades del Tratamiento de Datos
              </h2>
            </div>
            <p className="mb-4">
              Los datos recolectados por Huellitas serán utilizados para las siguientes finalidades legítimas relacionadas directamente con la atención y el servicio:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#faf5ec] border border-[#e8dccf]">
                <h3 className="font-semibold text-xs sm:text-sm text-[var(--color-brand,#234e46)] mb-1">
                  1. Prestación del Servicio Clínico
                </h3>
                <p className="text-xs text-[var(--color-slate,#334155)]/90">
                  Apertura y custodia de la historia clínica veterinaria, diagnóstico, formulación de medicamentos, planes de tratamiento, cirugías y hospitalización.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#faf5ec] border border-[#e8dccf]">
                <h3 className="font-semibold text-xs sm:text-sm text-[var(--color-brand,#234e46)] mb-1">
                  2. Agendamiento y Asistente Virtual
                </h3>
                <p className="text-xs text-[var(--color-slate,#334155)]/90">
                  Identificación de tutores en el chatbot, programación, confirmación, reprogramación o cancelación de citas médicas y procedimientos.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#faf5ec] border border-[#e8dccf]">
                <h3 className="font-semibold text-xs sm:text-sm text-[var(--color-brand,#234e46)] mb-1">
                  3. Notificaciones Preventivas y Salud
                </h3>
                <p className="text-xs text-[var(--color-slate,#334155)]/90">
                  Envío de alertas sobre fechas de vacunación, desparasitaciones periódicas, controles posoperatorios y resultados de exámenes de laboratorio.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#faf5ec] border border-[#e8dccf]">
                <h3 className="font-semibold text-xs sm:text-sm text-[var(--color-brand,#234e46)] mb-1">
                  4. Facturación y Cumplimiento Legal
                </h3>
                <p className="text-xs text-[var(--color-slate,#334155)]/90">
                  Emisión de facturas electrónicas, gestión contable y atención oportuna a requerimientos de autoridades judiciales o administrativas colombianas.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Datos Recolectados */}
          <section id="datos-recolectados" className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8dccf] shadow-2xs scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-[#e8efea] text-[var(--color-brand,#234e46)] flex items-center justify-center font-bold text-xs">
                4
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-brand,#234e46)]">
                Datos Personales Recolectados
              </h2>
            </div>
            <p className="mb-4">
              En el marco de la relación con el usuario, Huellitas podrá solicitar los siguientes datos pertinentes y no excesivos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#e8dccf] bg-white">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-brand,#234e46)] mb-2 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" /> Datos del Tutor / Titular
                </h3>
                <ul className="text-xs space-y-1 text-[var(--color-slate,#334155)]">
                  <li>• Nombres y apellidos completos</li>
                  <li>• Tipo y número de documento de identificación (C.C., C.E., Pasaporte)</li>
                  <li>• Número de teléfono de contacto y WhatsApp</li>
                  <li>• Correo electrónico</li>
                  <li>• Dirección de residencia (para visitas domiciliarias y facturación)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-[#e8dccf] bg-white">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-terracotta,#c86d51)] mb-2 flex items-center gap-1.5">
                  <PawIcon className="w-3.5 h-3.5" /> Datos del Paciente (Mascota)
                </h3>
                <ul className="text-xs space-y-1 text-[var(--color-slate,#334155)]">
                  <li>• Nombre de la mascota</li>
                  <li>• Especie (Canino, Felino, etc.) y Raza</li>
                  <li>• Sexo, edad o fecha aproximada de nacimiento</li>
                  <li>• Historial clínico, peso, vacunas previas y diagnósticos</li>
                  <li>• Fotografías para registro visual de la ficha médica</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-placeholder,#9aa8a2)] mt-3">
              * Huellitas no recolecta datos sensibles no indispensables ni realiza tratamiento de datos de menores sin la expresa autorización de sus representantes legales.
            </p>
          </section>

          {/* 5. Derechos del Titular */}
          <section id="derechos" className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8dccf] shadow-2xs scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-[#e8efea] text-[var(--color-brand,#234e46)] flex items-center justify-center font-bold text-xs">
                5
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-brand,#234e46)]">
                Derechos de los Titulares (Habeas Data)
              </h2>
            </div>
            <p className="mb-3">
              Como titular de los datos personales, de acuerdo con el artículo 8 de la Ley 1581 de 2012, usted tiene derecho a:
            </p>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <CheckCircleIcon className="w-4 h-4 text-[var(--color-brand,#234e46)] shrink-0 mt-0.5" />
                <span><strong>Conocer, actualizar y rectificar</strong> sus datos personales frente a Huellitas cuando sean parciales, inexactos, incompletos o fraccionados.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircleIcon className="w-4 h-4 text-[var(--color-brand,#234e46)] shrink-0 mt-0.5" />
                <span><strong>Solicitar prueba</strong> de la autorización otorgada a Huellitas para el tratamiento de su información.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircleIcon className="w-4 h-4 text-[var(--color-brand,#234e46)] shrink-0 mt-0.5" />
                <span><strong>Ser informado</strong> por Huellitas, previa solicitud, respecto del uso que se le ha dado a sus datos personales.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircleIcon className="w-4 h-4 text-[var(--color-brand,#234e46)] shrink-0 mt-0.5" />
                <span><strong>Revocar la autorización</strong> o solicitar la <strong>supresión de sus datos</strong> cuando en el tratamiento no se respeten los principios, derechos y garantías constitucionales y legales (siempre que no medie un deber legal o contractual de conservación).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircleIcon className="w-4 h-4 text-[var(--color-brand,#234e46)] shrink-0 mt-0.5" />
                <span><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC) por infracciones a lo dispuesto en la normatividad de protección de datos.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircleIcon className="w-4 h-4 text-[var(--color-brand,#234e46)] shrink-0 mt-0.5" />
                <span><strong>Acceder de forma gratuita</strong> a sus datos personales objeto de tratamiento en nuestras bases de datos.</span>
              </div>
            </div>
          </section>

          {/* 6. Seguridad y Confidencialidad */}
          <section id="seguridad" className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8dccf] shadow-2xs scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-[#e8efea] text-[var(--color-brand,#234e46)] flex items-center justify-center font-bold text-xs">
                6
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-brand,#234e46)]">
                Seguridad y Confidencialidad de la Información
              </h2>
            </div>
            <p className="mb-3">
              Huellitas adopta medidas de índole técnica, administrativa y humana necesarias para resguardar la integridad y seguridad de la información almacenada:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[var(--color-slate,#334155)]">
              <li>Mecanismos de autenticación y control de acceso basado en roles para el personal médico y administrativo.</li>
              <li>Cifrado de canales de comunicación digital mediante protocolo TLS/HTTPS.</li>
              <li>Restricción de acceso a historias clínicas exclusivamente a profesionales veterinarios autorizados.</li>
              <li>Copias de respaldo periódicas y monitoreo constante contra incidentes de seguridad.</li>
            </ul>
          </section>

          {/* 7. Procedimiento para Consultas y Reclamos (PQR) */}
          <section id="procedimiento-pqr" className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8dccf] shadow-2xs scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-[#e8efea] text-[var(--color-brand,#234e46)] flex items-center justify-center font-bold text-xs">
                7
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-brand,#234e46)]">
                Canales y Procedimiento para el Ejercicio de Derechos
              </h2>
            </div>
            <p className="mb-3">
              Para ejercer sus derechos de consulta, actualización, rectificación o supresión, el titular puede radicar su solicitud a través de:
            </p>
            <div className="p-4 rounded-xl bg-[#faf5ec] border border-[#e8dccf] mb-4">
              <p className="text-xs sm:text-sm">
                <strong>Canal Principal:</strong> Correo electrónico:{' '}
                <a href="mailto:privacidad@huellitasveterinaria.com" className="text-[var(--color-brand,#234e46)] underline font-semibold">
                  privacidad@huellitasveterinaria.com
                </a>
              </p>
              <p className="text-xs text-[var(--color-slate,#334155)] mt-1">
                Indicando en el asunto: <em>«Ejercicio de Derechos Habeas Data - [Nombre y Documento del Titular]»</em>.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#e8dccf]">
                <span className="font-bold text-[var(--color-brand,#234e46)] block mb-1">Término de Consultas</span>
                Las consultas serán atendidas en un plazo máximo de diez (10) días hábiles contados a partir de la fecha de recibo.
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#e8dccf]">
                <span className="font-bold text-[var(--color-brand,#234e46)] block mb-1">Término de Reclamos</span>
                Los reclamos de corrección o supresión se atenderán en un término máximo de quince (15) días hábiles.
              </div>
            </div>
          </section>

          {/* 8. Vigencia */}
          <section id="vigencia" className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8dccf] shadow-2xs scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-[#e8efea] text-[var(--color-brand,#234e46)] flex items-center justify-center font-bold text-xs">
                8
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-brand,#234e46)]">
                Vigencia y Modificaciones de la Política
              </h2>
            </div>
            <p>
              La presente Política entra en vigencia a partir del mes de septiembre de 2026. Las bases de datos en las que se registran los datos personales tendrán un periodo de vigencia correspondiente al tiempo en que se mantenga la relación de servicios veterinarios, o según lo exijan los términos legales de conservación de historias clínicas según el Consejo Profesional de Medicina Veterinaria y Zootecnia (COMVEZCOL).
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-placeholder,#9aa8a2)]">
              Cualquier modificación sustancial a las finalidades del tratamiento será notificada previamente a través de nuestro sitio web oficial o mediante el canal de contacto habitual.
            </p>
          </section>
        </div>

        {/* Tarjeta de descarga de PDF oficial */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#234e46] to-[#1d4337] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/20 mb-1">
              <DocumentTextIcon className="w-3.5 h-3.5" />
              <span>Documento Firmado PDF</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              ¿Deseas descargar la versión oficial de la Política?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              Conserva el documento oficial en formato PDF para archivo, impresión o verificación legal sin costo alguno.
            </p>
          </div>

          <a
            href="/politica-tratamiento-datos.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download="politica-tratamiento-datos-huellitas.pdf"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[var(--color-brand,#234e46)] hover:bg-[#faf5ec] font-bold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <DownloadIcon className="w-4 h-4 text-[var(--color-brand,#234e46)]" />
            <span>Descargar Documento PDF</span>
          </a>
        </div>
      </div>

      {/* Pie de página */}
      <footer className="mt-12 border-t border-[#e8dccf] bg-white/70 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-slate,#334155)]/70">
          <div className="flex items-center gap-2">
            <BrandLogo mark="principal" variant="transparent" alt="Huellitas" className="w-6 h-6 object-contain" />
            <span className="font-semibold text-[var(--color-brand,#234e46)]">Clínica Veterinaria Huellitas</span>
            <span>• © 2026 Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                const top = document.querySelector('header')
                if (top) top.scrollIntoView({ behavior: 'smooth' })
              }}
              className="hover:text-[var(--color-brand,#234e46)] underline cursor-pointer"
            >
              Volver arriba ↑
            </button>
            <span>•</span>
            <a
              href="/"
              onClick={handleLoginClick}
              className="text-[var(--color-brand,#234e46)] font-semibold hover:underline cursor-pointer"
            >
              Portal Colaboradores (Login)
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Iconos vectoriales limpios
function DownloadIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function PrinterIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

function UserIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function ShieldCheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function CalendarIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function CheckBadgeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function LockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function CheckCircleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function StethoscopeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  )
}

function MessageIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function PawIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d="M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5z" />
    </svg>
  )
}

function DocumentTextIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
