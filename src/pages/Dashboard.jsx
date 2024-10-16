import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import Box from '../components/box/Box'
import DashboardWrapper, { DashboardWrapperMain, DashboardWrapperRight } from '../components/dashboard-wrapper/DashboardWrapper'
import SummaryBox, { SummaryBoxSpecial } from '../components/summary-box/SummaryBox'
import { colors } from '../constants'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import OverallList from '../components/overall-list/OverallList'
import OrderStatusChart from '../components/order-status/OrderStatusChart'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

const Dashboard = () => {
    const [currentMonthSales, setCurrentMonthSales] = useState(null)
    const [orderStatusData, setOrderStatusData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [overallData, setOverallData] = useState(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('https://namami-infotech.com/EvaraBackend/src/report/monthly_report.php')
                const result = await response.json()

                if (result && result.data) {
                    // Get current month sales
                    const currentMonth = new Date().getMonth() + 1 // JavaScript months are 0-indexed
                    const currentMonthData = result.data.monthly_report.find(item => item.month === currentMonth)
                    const totalOrders = result.data.monthly_report.reduce((acc, item) => acc + item.total_orders, 0)
                    setCurrentMonthSales(currentMonthData ? parseFloat(currentMonthData.total_amount) : 0)
                    setOrderStatusData(result.data.order_status)
                    setOverallData({
                        overall: [
                            { value: totalOrders, title: 'Total Orders' },
                            { value: result.data.additional_info.active_dealers, title: 'Active Dealers' }, // Replace with actual data if available
                            { value: result.data.additional_info.total_products, title: 'Total Products' }, // Replace with actual data if available
                            { value: `₹${result.data.monthly_report.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0).toFixed(2)}`, title: 'Total Revenue' }
                        ]
                    })
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <DashboardWrapper>
            <DashboardWrapperMain>
                <div className="row">
                    <div className="col-6">
                        <Box>
                            <OrderStatusChart orderStatusData={orderStatusData} />
                        </Box>
                    </div>
                    <div className="col-6">
                        <Box>
                            <div className="title mb">Overall Performance</div>
                            {overallData && <OverallList overallData={overallData} />}
                        </Box>
                    </div>
                </div>

                <br />
                <div className="row">
                    <div className="col-12">
                        <Box>
                            <RevenueByMonthsChart />

                        </Box>
                    </div>
                </div>
            </DashboardWrapperMain>

        </DashboardWrapper>
    )
}

export default Dashboard




const RevenueByMonthsChart = () => {
    const [chartData, setChartData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Utility function to convert month number to month name
    const getMonthName = (monthNumber) => {
        const date = new Date();
        date.setMonth(monthNumber - 1); // Month number is 1-based
        return date.toLocaleString('default', { month: 'long' });
    }

    // Fetch data from the API
    useEffect(() => {
        const fetchMonthlyOrders = async () => {
            try {
                const response = await fetch('https://namami-infotech.com/EvaraBackend/src/report/monthly_report.php')
                const result = await response.json()

                if (result && result.data.monthly_report) {
                    // Format the data for the chart with month names
                    const labels = result.data.monthly_report.map(item => `${getMonthName(item.month)}, ${item.year}`)
                    const data = result.data.monthly_report.map(item => parseFloat(item.total_amount))

                    setChartData({
                        labels: labels,
                        datasets: [
                            {
                                label: 'Revenue',
                                data: data,
                                backgroundColor: '#008080',
                                borderRadius: 20,
                                borderSkipped: 'bottom'
                            }
                        ]
                    })
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error fetching monthly orders:', error)
            }
        }

        fetchMonthlyOrders()
    }, [])

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                grid: {
                    display: false,
                    drawBorder: false
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            }
        },
        elements: {
            bar: {
                backgroundColor: colors.orange,
                borderRadius: 20,
                borderSkipped: 'bottom',
            }
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <>
            <div className="title mb">
                Revenue by months
            </div>
            <div>
                <Bar options={chartOptions} data={chartData} height={300} />
            </div>
        </>
    )
}
