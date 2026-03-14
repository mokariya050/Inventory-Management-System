import { Doughnut } from 'react-chartjs-2'

const chartOptions = {
  plugins: {
    legend: { display: false },
  },
  maintainAspectRatio: false,
}

export default function RevenueChart({ labels, values, colors }) {
  const data = {
    labels: labels || [],
    datasets: [
      {
        label: '',
        backgroundColor: colors || ['#4e73df', '#1cc88a', '#36b9cc'],
        borderColor: (colors || ['#4e73df', '#1cc88a', '#36b9cc']).map(() => '#ffffff'),
        data: values || [],
      },
    ],
  }

  return (
    <div className="chart-area">
      <Doughnut data={data} options={chartOptions} />
    </div>
  )
}
