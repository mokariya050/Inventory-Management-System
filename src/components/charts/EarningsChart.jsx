import { Line } from 'react-chartjs-2'

const chartOptions = {
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

export default function EarningsChart({ labels, values }) {
  const data = {
    labels: labels || [],
    datasets: [
      {
        label: 'Earnings',
        fill: true,
        data: values || [],
        backgroundColor: 'rgba(78, 115, 223, 0.05)',
        borderColor: 'rgba(78, 115, 223, 1)',
      },
    ],
  }

  return (
    <div className="chart-area">
      <Line data={data} options={chartOptions} />
    </div>
  )
}
