import { Line } from 'react-chartjs-2'

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  datasets: [
    {
      label: 'Earnings',
      fill: true,
      data: [0, 10000, 5000, 15000, 10000, 20000, 15000, 25000],
      backgroundColor: 'rgba(78, 115, 223, 0.05)',
      borderColor: 'rgba(78, 115, 223, 1)',
    },
  ],
}

const options = {
  plugins: {
    legend: { display: false },
  },
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        color: 'rgb(234, 236, 244)',
        drawTicks: false,
        drawOnChartArea: false,
      },
      border: { display: false, dash: [2] },
      ticks: {
        color: '#858796',
        font: { style: 'normal' },
        padding: 20,
      },
    },
    y: {
      grid: {
        color: 'rgb(234, 236, 244)',
        drawTicks: false,
      },
      border: { display: false, dash: [2] },
      ticks: {
        color: '#858796',
        font: { style: 'normal' },
        padding: 20,
      },
    },
  },
}

export default function EarningsChart() {
  return (
    <div className="chart-area">
      <Line data={data} options={options} />
    </div>
  )
}
