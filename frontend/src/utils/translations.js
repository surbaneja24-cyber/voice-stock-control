export const translations = {
  es: {
    navbar: {
      descubre: "Descubre MyStock",
      instrucciones: "Instrucciones de Uso",
      planes: "Planes de Pago",
      piloto: "Programa Early Adopter",
      soporte: "Soporte y Empresa",
      faq: "FAQ",
      equipo: "Equipo de Desarrollo",
      login: "Acceso Clientes"
    },
    hero: {
      badge: "Gestión de Inventario impulsada por IA",
      title: "Controla Tu Stock Usando Tu Voz",
      subtitle: "Gestiona el inventario más rápido que nunca con inteligencia artificial, reconocimiento de voz y seguimiento de stock en tiempo real.",
      primaryBtn: "Iniciar Sesión",
      secondaryBtn: "Ver Planes de Pago"
    },
    login: {
      title: "Bienvenido de nuevo",
      subtitle: "Introduce tus credenciales operativas",
      emailLabel: "Correo electrónico",
      passLabel: "Contraseña",
      btnSubmit: "Entrar al Almacén",
      btnLoading: "Autenticando...",
      back: "Volver al inicio"
    },
    register: {
      title: "Registrar Operario",
      subtitle: "Crea una credencial nueva para el acceso al WMS.",
      nameLabel: "Nombre Completo",
      emailLabel: "Correo Corporativo",
      passLabel: "Contraseña de Acceso",
      confirmLabel: "Confirmar Contraseña",
      btnSubmit: "Confirmar Registro",
      btnLoading: "Creando cuenta..."
    },
    manual: {
      title: "Guía de Operación y Control de Errores",
      subtitle: "Manual técnico para operarios y administradores del motor de voz MyStock.",
      rulesTitle: "Reglas de Oro para Mitigar Fallos",
      rules: [
        {
          title: "La Regla de la Pausa",
          desc: "Presiona el botón de grabación y espera medio segundo antes de hablar. Si empiezas de inmediato, el motor cortará la primera sílaba y la IA no reconocerá el comando."
        },
        {
          title: "Control del Ruido Ambiente",
          desc: "El motor local faster-whisper es potente, pero ruidos extremos de montacargas o extractores industriales distorsionan el audio. Habla cerca del sensor del micrófono."
        },
        {
          title: "Validación de Retorno",
          desc: "Cada comando exitoso devuelve un cuadro verde de confirmación. Si ves un cuadro rojo o una cantidad errónea, recurre de inmediato al ajuste manual en la tabla del catálogo."
        },
        {
          title: "Nombres Claros de SKU",
          desc: "Evita registrar productos con códigos extraños o palabras excesivamente complejas. Los nombres legibles y directos facilitan el trabajo del emparejamiento fonético."
        }
      ]
    },
    pricing: {
      title: "Planes que escalan con tu ",
      subtitle: "Desde una pequeña tienda hasta un centro de distribución global. Controla todo con el poder de tu voz.",
      loading: "Sincronizando tarifas con el motor central...",
      connError: "Error de Comunicación",
      customNotice: "¿Necesitas algo a medida? Ofrecemos despliegues en servidores locales para empresas con requisitos de seguridad estrictos.",
      recommended: "Recomendado",
      plansData: [
        {
          name: "Lite",
          price: "Gratis",
          period: "para siempre",
          description: "Ideal para pequeñas tiendas y pruebas de concepto.",
          features: ["Hasta 50 productos", "Reconocimiento de voz estándar", "Soporte comunitario"],
          buttonText: "Comenzar Gratis"
        },
        {
          name: "Pro",
          price: "$49",
          period: "/mes",
          description: "Para almacenes en crecimiento que necesitan velocidad.",
          features: ["Productos ilimitados", "Voz de alta precisión (Whisper)", "Soporte prioritario", "Exportación CSV"],
          buttonText: "Prueba de 14 días"
        },
        {
          name: "Industrial",
          price: "A medida",
          period: "",
          description: "Despliegues on-premise para máxima seguridad.",
          features: ["Servidor local propio", "SLA 99.9%", "Integración SAP/ERP", "Modelo acústico entrenado"],
          buttonText: "Contactar Ventas"
        }
      ]
    },
    equipo: {
      badge: "Equipo de MyStock",
      title: "El motor detrás de la voz.",
      subtitle: "MyStock no es magia; es infraestructura pura. Conoce a los ingenieros responsables de traducir ondas sonoras en persistencia de datos.",
      advisorsTitle: "Orígenes & Technical Advisors",
      advisorsDesc: "La arquitectura fundamental de MyStock fue incubada dentro del ecosistema tecnológico de 4Geeks Academy. Este proyecto no sería posible sin la auditoría de código, dirección arquitectónica y revisión crítica de nuestra junta de asesores.",
      members: [
        {
          name: "Marc Dominguez",
          role: "Backend & Database Architect",
          focus: "Modelado de datos, concurrencia en FastAPI y orquestación general del motor."
        },
        {
          name: "Santiago Urbaneja",
          role: "Voice API & Auth Integrator",
          focus: "Implementación del modelo neuronal Whisper, seguridad JWT y lógica de inferencia."
        },
        {
          name: "Gabriel Mendez",
          role: "Frontend & QA Engineer",
          focus: "Experiencia de usuario (React), flujos de estado y pruebas de integración (Testing)."
        }
      ]
    },
    faq: {
      badge: "Centro de Ayuda BETA",
      title: "Preguntas Frecuentes",
      subtitle: "Resolvemos tus dudas sobre el motor de MyStock, integraciones y límites de uso.",
      categories: [
        {
          title: "General",
          questions: [
            {
              q: "¿Qué es MyStock y en qué fase se encuentra?",
              a: "MyStock es un motor de gestión de inventario por voz (WMS). Actualmente nos encontramos en fase BETA cerrada, optimizando nuestro modelo acústico para entornos industriales."
            },
            {
              q: "¿Necesito hardware especial para usarlo?",
              a: "No. MyStock funciona en cualquier dispositivo con navegador web moderno y micrófono (smartphones, tablets industriales, o PCs). Recomendamos micrófonos con cancelación de ruido para almacenes muy ruidosos."
            }
          ]
        },
        {
          title: "Técnico y Funcionalidad",
          questions: [
            {
              q: "¿Qué motor de IA utiliza el sistema?",
              a: "Utilizamos una implementación optimizada de faster-whisper ejecutada en nuestro propio backend, garantizando que el procesamiento de voz sea rápido y privado."
            },
            {
              q: "¿Qué pasa si el sistema no entiende mi pronunciación?",
              a: "MyStock incorpora algoritmos de 'Fuzzy Matching' (Coincidencia Difusa) que toleran ligeras variaciones silábicas. Sin embargo, para mayor precisión, recomendamos usar el formato: [Acción] + [Cantidad] + [Producto]."
            },
            {
              q: "¿Puedo importar mi catálogo actual?",
              a: "En la fase BETA actual, la siembra del catálogo se realiza de forma manual o mediante el registro inicial. La importación masiva por CSV estará disponible en la versión 1.0."
            }
          ]
        },
        {
          title: "Facturación y Límites",
          questions: [
            {
              q: "¿Qué ocurre si supero el límite de 50 productos en el plan Lite?",
              a: "El sistema bloqueará la creación de nuevos ítems mediante un error 400. Tu inventario existente seguirá funcionando perfectamente, pero deberás actualizar al plan Pro para expandir tu catálogo."
            },
            {
              q: "¿Cómo funciona el Programa Early Adopter?",
              a: "Si eres seleccionado como empresa piloto, obtendrás acceso a las capacidades del plan Industrial de forma gratuita durante la duración del piloto, a cambio de tu retroalimentación directa con nuestros ingenieros."
            }
          ]
        }
      ]
    },
    settings: {
      title: "Configuración",
      subtitle: "Gestiona tus preferencias de MyStock.",
      appearance: "Apariencia",
      darkMode: "Modo Oscuro",
      enabled: "Activado",
      disabled: "Desactivado",
      language: "Idioma",
      voiceTerminal: "Terminal de Voz",
      recLanguage: "Idioma de Reconocimiento",
      confSound: "Sonido de Confirmación",
      autoExec: "Ejecutar Comandos Automáticamente",
      notifications: "Notificaciones",
      lowStock: "Alertas de Stock Bajo",
      desktopNotif: "Notificaciones de Escritorio",
      about: "Acerca de",
      version: "Versión",
      desc: "Sistema de gestión de inventario impulsado por voz."
    },
    pilot: {
      badge: "Programa Early Adopter",
      title: "Únete al Piloto de MyStock",
      subtitle: "Buscamos empresas asociadas para implementar la gestión de inventario por voz sin costes de licencia durante la fase BETA.",
      cardTitle: "Beneficios del Programa",
      benefit1: "Acceso gratuito e ilimitado al Plan Industrial durante el piloto.",
      benefit2: "Soporte técnico prioritario directo con nuestros ingenieros.",
      benefit3: "Modelos acústicos personalizados adaptados al ruido de tu almacén.",
      formTitle: "Solicitar Acceso Piloto",
      labelCompany: "Nombre de la Empresa",
      labelEmail: "Correo Electrónico de Contacto",
      labelWarehouse: "Tamaño del Almacén / Sector",
      placeholderWarehouse: "Ej. Distribución de Bebidas, 1200m²",
      btnSubmit: "Enviar Solicitud",
      successMsg: "¡Solicitud recibida! Nuestro equipo se pondrá en contacto pronto."
    },
    register: {
      title: "Registrar Operario",
      subtitle: "Crea una credencial nueva para el acceso al WMS.",
      nameLabel: "Nombre Completo",
      namePlaceholder: "Ej. Juan Pérez",
      emailLabel: "Correo Corporativo",
      passLabel: "Contraseña de Acceso",
      passPlaceholder: "Mínimo 6 caracteres",
      confirmLabel: "Confirmar Contraseña",
      confirmPlaceholder: "Repite la contraseña",
      strengthLabel: "Fuerza de la contraseña",
      strength: { veryWeak: "Muy débil", weak: "Débil", medium: "Media", strong: "Segura" },
      btnSubmit: "Confirmar Registro",
      btnLoading: "Creando cuenta...",
      footerText: "¿El operario ya tiene cuenta?",
      footerLink: "Iniciar sesión aquí",
      errors: {
        required: "Por favor, completa todos los campos requeridos.",
        match: "Las contraseñas no coinciden.",
        length: "La contraseña debe tener al menos 6 caracteres.",
        validation: "Error de validación en el formulario.",
        generic: "Error en el proceso de registro.",
        unreachable: "Error crítico: Servidor inalcanzable."
      }
    }
  },

  en: {
    navbar: {
      descubre: "Discover MyStock",
      instrucciones: "How it Works",
      planes: "Pricing Plans",
      piloto: "Early Adopter Program",
      soporte: "Support & Company",
      faq: "FAQ",
      equipo: "Development Team",
      login: "Client Access"
    },
    hero: {
      badge: "AI Powered Inventory Management",
      title: "Control Your Stock Using Your Voice",
      subtitle: "Manage inventory faster than ever with artificial intelligence, voice recognition and real-time stock tracking.",
      primaryBtn: "Log In",
      secondaryBtn: "View Pricing Plans"
    },
    login: {
      title: "Welcome back",
      subtitle: "Enter your operative credentials",
      emailLabel: "Email address",
      passLabel: "Password",
      btnSubmit: "Enter Warehouse",
      btnLoading: "Authenticating...",
      back: "Back to home"
    },
    register: {
      title: "Register Operator",
      subtitle: "Create a new credential to access the WMS.",
      nameLabel: "Full Name",
      emailLabel: "Corporate Email",
      passLabel: "Access Password",
      confirmLabel: "Confirm Password",
      btnSubmit: "Confirm Registration",
      btnLoading: "Creating account..."
    },
    manual: {
      title: "Operation and Error Control Guide",
      subtitle: "Technical manual for operators and administrators of the MyStock voice engine.",
      rulesTitle: "Golden Rules to Mitigate Errors",
      rules: [
        {
          title: "The Pause Rule",
          desc: "Press the record button and wait half a second before speaking. If you start immediately, the engine will cut off the first syllable and the AI won't recognize the command."
        },
        {
          title: "Ambient Noise Control",
          desc: "The local faster-whisper engine is powerful, but extreme noise from forklifts or industrial exhaust fans will distort the audio. Speak close to the microphone sensor."
        },
        {
          title: "Return Validation",
          desc: "Every successful command returns a green confirmation box. If you see a red box or an incorrect amount, immediately resort to manual adjustment in the catalog table."
        },
        {
          title: "Clear SKU Names",
          desc: "Avoid registering products with strange codes or overly complex words. Legible and direct names make phonetic matching much easier."
        }
      ]
    },
    pricing: {
      title: "Plans that scale with your ",
      subtitle: "From a small shop to a global distribution center. Control everything with the power of your voice.",
      loading: "Synchronizing rates with the central engine...",
      connError: "Communication Error",
      customNotice: "Need something custom? We offer on-premise deployments for companies with strict security requirements.",
      recommended: "Recommended",
      plansData: [
        {
          name: "Lite",
          price: "Free",
          period: "forever",
          description: "Ideal for small shops and proof of concepts.",
          features: ["Up to 50 products", "Standard voice recognition", "Community support"],
          buttonText: "Get Started Free"
        },
        {
          name: "Pro",
          price: "$49",
          period: "/mo",
          description: "For growing warehouses that need high speed.",
          features: ["Unlimited products", "High-precision voice (Whisper)", "Priority support", "CSV Export"],
          buttonText: "14-day Trial"
        },
        {
          name: "Industrial",
          price: "Custom",
          period: "",
          description: "On-premise deployments for maximum security.",
          features: ["Own local server", "99.9% SLA", "SAP/ERP Integration", "Trained acoustic model"],
          buttonText: "Contact Sales"
        }
      ]
    },
    equipo: {
      badge: "MyStock Team",
      title: "The engine behind the voice.",
      subtitle: "MyStock isn't magic; it's pure infrastructure. Meet the engineers responsible for translating sound waves into data persistence.",
      advisorsTitle: "Origins & Technical Advisors",
      advisorsDesc: "The core architecture of MyStock was incubated within the 4Geeks Academy tech ecosystem. This project would not be possible without the code auditing, architectural guidance, and critical review of our advisory board.",
      members: [
        {
          name: "Marc Dominguez",
          role: "Backend & Database Architect",
          focus: "Data modeling, FastAPI concurrency, and general engine orchestration."
        },
        {
          name: "Santiago Urbaneja",
          role: "Voice API & Auth Integrator",
          focus: "Implementation of the Whisper neural model, JWT security, and inference logic."
        },
        {
          name: "Gabriel Mendez",
          role: "Frontend & QA Engineer",
          focus: "User experience (React), state workflows, and integration testing."
        }
      ]
    },
    faq: {
      badge: "BETA Help Center",
      title: "Frequently Asked Questions",
      subtitle: "We answer your questions about the MyStock engine, integrations, and usage limits.",
      categories: [
        {
          title: "General",
          questions: [
            {
              q: "What is MyStock and what phase is it in?",
              a: "MyStock is a voice-controlled inventory management engine (WMS). We are currently in a closed BETA phase, optimizing our acoustic model for industrial environments."
            },
            {
              q: "Do I need special hardware to use it?",
              a: "No. MyStock works on any device with a modern web browser and microphone (smartphones, industrial tablets, or PCs). We recommend noise-canceling microphones for very noisy warehouses."
            }
          ]
        },
        {
          title: "Technical & Functionality",
          questions: [
            {
              q: "What AI engine does the system use?",
              a: "We use an optimized implementation of faster-whisper running on our own backend, ensuring that voice processing is fast and private."
            },
            {
              q: "What happens if the system doesn't understand my pronunciation?",
              a: "MyStock incorporates 'Fuzzy Matching' algorithms that tolerate slight syllabic variations. However, for higher accuracy, we recommend using the format: [Action] + [Quantity] + [Product]."
            },
            {
              q: "Can I import my current catalog?",
              a: "In the current BETA phase, catalog seeding is done manually or via initial registration. Bulk CSV import will be available in version 1.0."
            }
          ]
        },
        {
          title: "Billing & Limits",
          questions: [
            {
              q: "What happens if I exceed the 50-product limit on the Lite plan?",
              a: "The system will block the creation of new items via a 400 error. Your existing inventory will continue to work perfectly, but you will need to upgrade to the Pro plan to expand your catalog."
            },
            {
              q: "How does the Early Adopter Program work?",
              a: "If you are selected as a pilot company, you will gain access to the capabilities of the Industrial plan for free for the duration of the pilot, in exchange for your direct feedback with our engineers."
            }
          ]
        }
      ]
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your MyStock preferences.",
      appearance: "Appearance",
      darkMode: "Dark Mode",
      enabled: "Enabled",
      disabled: "Disabled",
      language: "Language",
      voiceTerminal: "Voice Terminal",
      recLanguage: "Recognition Language",
      confSound: "Confirmation Sound",
      autoExec: "Auto Execute Commands",
      notifications: "Notifications",
      lowStock: "Low Stock Alerts",
      desktopNotif: "Desktop Notifications",
      about: "About",
      version: "Version",
      desc: "Voice-powered inventory management system."
    },
    pilot: {
      badge: "Early Adopter Program",
      title: "Join the MyStock Pilot",
      subtitle: "We are looking for partner companies to deploy voice-powered inventory management with zero license fees during the BETA phase.",
      cardTitle: "Program Benefits",
      benefit1: "Free and unlimited access to the Industrial Plan during the pilot.",
      benefit2: "Priority technical support directly with our engineers.",
      benefit3: "Custom acoustic models optimized for your warehouse background noise.",
      formTitle: "Apply for Pilot Access",
      labelCompany: "Company Name",
      labelEmail: "Contact Email",
      labelWarehouse: "Warehouse Size / Sector",
      placeholderWarehouse: "e.g., Beverage Distribution, 1200m²",
      btnSubmit: "Submit Application",
      successMsg: "Application received! Our team will get in touch shortly."
    },
    register: {
      title: "Register Operator",
      subtitle: "Create a new credential to access the WMS.",
      nameLabel: "Full Name",
      namePlaceholder: "e.g. John Doe",
      emailLabel: "Corporate Email",
      passLabel: "Access Password",
      passPlaceholder: "Minimum 6 characters",
      confirmLabel: "Confirm Password",
      confirmPlaceholder: "Repeat password",
      strengthLabel: "Password Strength",
      strength: { veryWeak: "Very weak", weak: "Weak", medium: "Medium", strong: "Strong" },
      btnSubmit: "Confirm Registration",
      btnLoading: "Creating account...",
      footerText: "Does the operator already have an account?",
      footerLink: "Log in here",
      errors: {
        required: "Please fill in all required fields.",
        match: "Passwords do not match.",
        length: "Password must be at least 6 characters.",
        validation: "Form validation error.",
        generic: "Error during registration.",
        unreachable: "Critical error: Server unreachable."
      }
    }
  },

  zh: {
    navbar: {
      descubre: "探索 MyStock",
      instrucciones: "使用说明",
      planes: "付费方案",
      piloto: "早期采纳者计划",
      soporte: "技术支持与公司",
      faq: "常见问题",
      equipo: "开发团队",
      login: "客户登录"
    },
    hero: {
      badge: "人工智能驱动的库存管理",
      title: "用你的声音控制你的库存",
      subtitle: "利用人工智能、语音识别和实时库存追踪，比以往更快地管理库存。",
      primaryBtn: "登录",
      secondaryBtn: "查看付费方案"
    },
    login: {
      title: "欢迎回来",
      subtitle: "请输入您的操作凭证",
      emailLabel: "电子邮箱",
      passLabel: "密码",
      btnSubmit: "进入仓库",
      btnLoading: "正在验证...",
      back: "返回首页"
    },
    register: {
      title: "注册操作员",
      subtitle: "创建新凭证以访问 WMS 仓库管理系统。",
      nameLabel: "全名",
      emailLabel: "公司邮箱",
      passLabel: "访问密码",
      confirmLabel: "确认密码",
      btnSubmit: "确认注册",
      btnLoading: "正在创建账户..."
    },
    manual: {
      title: "操作与错误控制指南",
      subtitle: "MyStock 语音引擎操作员 and 管理员技术手册。",
      rulesTitle: "减少错误的核心规则",
      rules: [
        {
          title: "暂停规则",
          desc: "按下录音按钮，等待半秒后再说话。如果立即开始，引擎会切断第一个音节，导致人工智能无法识别命令。"
        },
        {
          title: "环境噪音控制",
          desc: "本地 faster-whisper 引擎非常强大，但叉车或工业排风扇的极端噪音会使音频失真。请靠近麦克风传感器说话。"
        },
        {
          title: "返回结果验证",
          desc: "每个成功的命令都会返回一个绿色的确认框。如果看到红框或错误数量，请立即在目录表中进行手动调整。"
        },
        {
          title: "清晰的 SKU 名称",
          desc: "避免使用奇怪的代码或过于复杂的词汇注册产品。清晰直观的名称可以让语音匹配变得更加容易。"
        }
      ]
    },
    pricing: {
      title: "伴随您的库存一同扩展的",
      subtitle: "从小型商店到全球分销中心。用您的声音控制一切。",
      loading: "正在与核心引擎同步资费...",
      connError: "通信错误",
      customNotice: "需要定制解决方案吗？我们为有严格安全要求的企业提供本地化服务器部署。",
      recommended: "推荐",
      plansData: [
        {
          name: "精简版",
          price: "免费",
          period: "永久",
          description: "适合小型商店和概念验证测试。",
          features: ["最多 50 个产品", "标准语音识别", "社区支持"],
          buttonText: "免费开始"
        },
        {
          name: "专业版",
          price: "$49",
          period: "/月",
          description: "适合需要高效处理的成长型仓库。",
          features: ["无限制产品数量", "高精度语音识别 (Whisper)", "优先技术支持", "CSV 数据导出"],
          buttonText: "14天免费试用"
        },
        {
          name: "工业级",
          price: "定制解决方案",
          period: "",
          description: "本地化部署，保障最高级别的数据安全。",
          features: ["独立本地服务器", "99.9% 运行时间保证 (SLA)", "SAP/ERP 系统集成", "专属定制声学模型"],
          buttonText: "联系销售"
        }
      ]
    },
    equipo: {
      badge: "MyStock 团队",
      title: "语音背后的核心引擎",
      subtitle: "MyStock 并非魔法，而是纯粹的底层架构。见证将声波转化为数据持久化存储的工程师们。",
      advisorsTitle: "起源与技术顾问",
      advisorsDesc: "MyStock 的核心架构孵化于 4Geeks Academy 技术生态系统。如果没有顾问委员会的代码审计、架构指导和审慎评估，该项目就不可能实现。",
      members: [
        {
          name: "Marc Dominguez",
          role: "后端与数据库架构师",
          focus: "数据建模、FastAPI 并发处理以及引擎的整体编排。"
        },
        {
          name: "Santiago Urbaneja",
          role: "语音 API 与认证集成师",
          focus: "Whisper 神经网络模型的高效实现、JWT 安全验证以及推理逻辑。"
        },
        {
          name: "Gabriel Mendez",
          role: "前端与质量保证工程师",
          focus: "用户体验 (React)、状态流管理以及完整的集成测试 (Testing)。"
        }
      ]
    },
    faq: {
      badge: "BETA 帮助中心",
      title: "常见问题",
      subtitle: "为您解答关于 MyStock 引擎、系统集成以及使用限制的所有疑问。",
      categories: [
        {
          title: "常规问题",
          questions: [
            {
              q: "什么是 MyStock？目前处于什么阶段？",
              a: "MyStock 是一款语音驱动的库存管理系统 (WMS)。目前我们正处于封闭式 BETA 测试阶段，致力于针对工业生产环境优化声学模型。"
            },
            {
              q: "我需要特殊的硬件设备来运行 it 吗？",
              a: "不需要。MyStock 可以在任何配备现代浏览器和麦克风的设备上运行（智能手机、工业平板电脑或电脑）。对于噪音极大的仓库环境，我们建议使用带降噪功能的麦克风。"
            }
          ]
        },
        {
          title: "技术与功能性",
          questions: [
            {
              q: "系统使用的是什么人工智能引擎？",
              a: "我们在自有后端运行了经过深度优化的 faster-whisper 实现，从而确保语音处理的高效性与数据私密性。"
            },
            {
              q: "如果系统无法准确识别我的发音该怎么办？",
              a: "MyStock 内置了“模糊匹配” (Fuzzy Matching) 算法，能容忍轻微的音节偏差。不过为了达到最高精确度，我们建议使用标准指令格式：[操作] + [数量] + [产品名称]。"
            },
            {
              q: "我可以导入现有的产品目录吗？",
              a: "在当前的 BETA 阶段，产品目录的添加需要通过初始注册或手动录入。CSV 批量导入功能将在 1.0 正式版本中提供。"
            }
          ]
        },
        {
          title: "计费与额度限制",
          questions: [
            {
              q: "如果我超出了精简版 (Lite) 方案中 50 个产品的限制会怎样？",
              a: "系统将通过 400 错误码拦截新物品的创建。您现有的库存数据可以完好无损地正常配合系统运转，但您需要升级至专业版 (Pro) 方案来扩充目录容量。"
            },
            {
              q: "早期采纳者计划 (Early Adopter) 是如何运作的？",
              a: "如果您被选为试点企业，您将在试点期间免费获得工业级方案的所有高级功能服务，以此换取您与我们工程师之间的直接反馈与技术调优交流。"
            }
          ]
        }
      ]
    },
    settings: {
      title: "设置",
      subtitle: "管理您的 MyStock 偏好设置。",
      appearance: "外观界面",
      darkMode: "深色模式",
      enabled: "已启用",
      disabled: "已禁用",
      language: "语言设定",
      voiceTerminal: "语音终端",
      recLanguage: "语音识别语言",
      confSound: "确认提示音",
      autoExec: "自动执行指令",
      notifications: "通知设定",
      lowStock: "低库存预警",
      desktopNotif: "桌面系统通知",
      about: "关于系统",
      version: "版本号",
      desc: "人工智能语音驱动的仓库库存 WMS 管理系统。"
    },
    pilot: {
      badge: "早期采纳者计划",
      title: "加入 MyStock 试点项目",
      subtitle: "我们正在寻找企业合作伙伴，在 BETA 测试阶段免费部署人工智能语音库存管理系统，免除一切授权费用。",
      cardTitle: "项目核心权益",
      benefit1: "试点期间免费且无限制地使用“工业级方案”所有功能。",
      benefit2: "与我们的核心研发工程师直接对接，享有最高优先级的技术支持。",
      benefit3: "针对您仓库的特定背景噪音，定制专属的声学识别模型。",
      formTitle: "申请试点入驻",
      labelCompany: "企业 / 公司名称",
      labelEmail: "业务联系邮箱",
      labelWarehouse: "仓库规模 / 所属行业",
      placeholderWarehouse: "例如：饮品物流仓储，1200平米",
      btnSubmit: "提交入驻申请",
      successMsg: "申请已成功提交！我们的团队将尽快与您取得联系。"
    },
    register: {
      title: "注册仓储操作员",
      subtitle: "创建新凭证以访问 WMS 仓储管理系统。",
      nameLabel: "完整姓名",
      namePlaceholder: "例如：张三",
      emailLabel: "企业电子邮箱",
      passLabel: "访问密码",
      passPlaceholder: "至少 6 个字符",
      confirmLabel: "确认密码",
      confirmPlaceholder: "请再次输入密码",
      strengthLabel: "密码强度",
      strength: { veryWeak: "极弱", weak: "弱", medium: "中等", strong: "安全" },
      btnSubmit: "确认注册",
      btnLoading: "正在创建账户...",
      footerText: "操作员已经拥有账户？",
      footerLink: "在此登录",
      errors: {
        required: "请填写所有必填字段。",
        match: "两次输入的密码不一致。",
        length: "密码长度必须至少为 6 个字符。",
        validation: "表单验证错误。",
        generic: "注册过程中发生错误。",
        unreachable: "关键错误：无法连接到服务器。"
      }
    }
}
};