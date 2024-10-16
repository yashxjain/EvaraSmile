import 'boxicons'

const sidebarNav = [
    {
        link: '/admin',
        section: 'home',
        icon: <i className='bx bx-home-alt'></i>,
        text: 'Home'
    },
    {
        link: '/admin/orders',
        section: 'orders',
        icon: <i className='bx bx-receipt' ></i>,
        text: 'Orders'
    },
    {
        link: '/admin/products',
        section: 'products',
        icon: <i className='bx bx-cube'></i>,
        text: 'Products'
    },
    {
        link: '/admin/clients',
        section: 'clients',
        icon: <i className='bx bx-user'></i>,
        text: 'Clients'
    },
    {
        link: '/admin/offer',
        section: 'offer',
        icon: <i className='bx bxs-offer'></i>,
        text: 'Offers'
    },
    {
        link: '/admin/stock',
        section: 'stock',
        icon: <i className='bx bx-box'></i>,
        text: 'Stock'
    },
    {
        link: '/admin/request',
        section: 'request',
        icon: <i className='bx bx-cart'></i>,
        text: 'Request Product'
    }

]

export default sidebarNav