const { createBot, createProvider, createFlow, addKeyword, addAnswer } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const flowSecundario = addKeyword(['Hacer un pedido', 'siguiente', 'pedido']).addAnswer([
    '🛒 Aquí encontras el link de la *Tienda virtual de Naturchem*',
    'https://naturchem.vercel.app/',
    'Si quieres regresar al menu de opciones responde con *ver menú*'
], {
    capture: true,
}
, async (ctx, { gotoFlow }) => {
    const respuestas = ['ver menú', 'ver menu', 'Ver menú', 'atras', 'menu', 'menú']
    if (respuestas.includes(ctx.body.toLowerCase())) {
        console.log('tamos aki')
        return gotoFlow(flowOpciones);
    } else {
        return gotoFlow(flowAtención);
    }
})

const flowPedido = addKeyword(['portafolio de productos', 'ver catálogo', 'ver catalogo', 'Ver catálogo', 'productos', 'catálogo', 'catalogo', 'lista de precios', 'precios', 'lista'])
    .addAnswer([
        '📄 Aquí encontras el *Portafolio de productos de Naturchem 🌿*',
        'https://drive.google.com/file/d/15dL12VfZHYY9gEVp6IaulZ9zar7O-Mq1/view',
        'Si quieres regresar al menu de opciones responde con *ver menú*'
    ],
        {
            capture: true,
        }
        , async (ctx, { gotoFlow }) => {
            const respuestas = ['ver menú', 'ver menu', 'Ver menú', 'atras', 'menu', 'menú']
            if (respuestas.includes(ctx.body.toLowerCase())) {
                console.log('tamos aki')
                return gotoFlow(flowOpciones);
            } else {
                return gotoFlow(flowAtención);
            }
        });

const flowAtención = addKeyword(['comunicarme con un asesor', 'Atención al cliente', 'asesor', 'Atención cliente']).addAnswer(
    [
        'En pocos minutos un asesor de Naturchem se comunicará contigo',
    ],
    null,
    null,
    [flowSecundario]
)

const flowPrincipal = addKeyword(['Hola', 'hola', 'buenas', 'buenas tardes', 'buenos dias', 'hello', 'hi'])
    .addAnswer('🌿 ¡Hola! Bienvenido/a  a Naturchem 🌿 \n Somos una empresa internacional con más de 10 años de experiencia en productos naturales. Estoy aquí para ayudarte. 😊',)
    .addAnswer(
        '¿cómo te llamas?',
        {
            capture: true,
        },
        async (ctx, { flowDynamic, state }) => {
            await state.update({ name: ctx.body })
            const myState = state.getMyState()
            await flowDynamic(`¡Es un gusto conocerte, ${myState.name}!`)
        }
    )
    .addAnswer(
        '¿Desde dónde nos visitas?',
        {
            capture: true,
        },
        async (ctx, { flowDynamic, state }) => {
            try {
                await state.update({ age: ctx.body })
                const myState = state.getMyState()
                await flowDynamic(`Gracias por visitarnos! ${myState.name}`)
            } catch (error) {
                console.error('Error al procesar la edad:', error)
            }
        }
    )
    .addAnswer(
        [
            '¿Qué te gustaría saber hoy sobre Naturchem? Aquí te dejo algunas opciones para empezar:',
            '👉 Ver nuestro catálogo de productos: escribe o responde con *ver catálogo*',
            '🛒 Hacer un pedido: escribe o responde con *hacer un pedido*',
            '📱 Hablar con un asesor: escribe o responde con *asesor* o *atención al cliente*'
        ],
        null,
        null,
        [flowSecundario, flowPedido, flowAtención]
    )

const flowOpciones = addKeyword(['🧼', 'jabon', 'jabones']).addAnswer(
    [
        'Bienvenido de nuevo al menú:',
        '👉 Ver nuestro catálogo de productos: escribe o responde con *ver catálogo*',
        '🛒 Hacer un pedido: escribe o responde con *hacer un pedido*',
        '📱 Hablar con un asesor: escribe o responde con *asesor* o *atención al cliente*'
    ],
    null,
    null,
    [flowSecundario, flowPedido, flowAtención]
)

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
