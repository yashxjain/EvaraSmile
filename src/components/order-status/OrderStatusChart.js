import React, { useState } from 'react'
import { Chart } from 'react-google-charts'
import { colors } from '../../constants'
import './style.scss'

const OrderStatusChart = ({ orderStatusData }) => {
    const [timePeriod, setTimePeriod] = useState('today')

    // Prepare data for the pie chart
    const getDataForPeriod = (period) => {
        if (orderStatusData) {
            const totalOrders = Number(orderStatusData[period].total_orders)
            const acceptedOrders = Number(orderStatusData[period].accepted_orders)
            const rejectedOrders = Number(orderStatusData[period].rejected_orders)
            const deliveredOrders = Number(orderStatusData[period].delivered_orders)

            return [
                ['Order Type', 'Number of Orders'],
                ['Total Orders', totalOrders],
                ['Accepted Orders', acceptedOrders],
                ['Rejected Orders', rejectedOrders],
                ['Delivered Orders', deliveredOrders]
            ]
        }
        return [['Order Type', 'Number of Orders'], ['No Data', 0]]
    }

    const chartData = getDataForPeriod(timePeriod)

    const chartOptions = {
        pieHole: 0.4,
        is3D: true,
        colors: [
            colors.purple,    // Total Orders
            colors.green,     // Accepted Orders
            colors.red,       // Rejected Orders
            colors.orange     // Delivered Orders
        ],
        // slices: {
        //     0: { offset: 0.1 }, // Total Orders
        //     1: { offset: 0.1 }, // Accepted Orders
        //     2: { offset: 0.1 }, // Rejected Orders
        //     3: { offset: 0.1 }  // Delivered Orders
        // },
        pieSliceText: 'value', // Display the number of orders on the chart slices


    }


    return (
        <>
            <div className="title mb">
                Orders Status
            </div>
            <div className="mb">
                <button
                    onClick={() => setTimePeriod('today')}
                    className={`btn ${timePeriod === 'today' ? 'btn-active' : ''}`}
                >
                    Today
                </button>
                <button
                    onClick={() => setTimePeriod('last_7_days')}
                    className={`btn ${timePeriod === 'last_7_days' ? 'btn-active' : ''}`}
                >
                    Last 7 Days
                </button>
                <button
                    onClick={() => setTimePeriod('last_30_days')}
                    className={`btn ${timePeriod === 'last_30_days' ? 'btn-active' : ''}`}
                >
                    Last 30 Days
                </button>
            </div>
            <div>
                <Chart
                    chartType="PieChart"
                    data={chartData}
                    options={chartOptions}
                    width={"100%"}
                    height={"245px"}
                />
            </div>
        </>
    )
}

export default OrderStatusChart
