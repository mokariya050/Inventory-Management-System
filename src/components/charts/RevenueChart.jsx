import { Doughnut } from 'react-chartjs-2'

const data = {
  labels: ['Direct', 'Social', 'Referral'],
  datasets: [
    {
      label: '',
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
      borderColor: ['#ffffff', '#ffffff', '#ffffff'],
      data: [50, 30, 15],
    },
  ],
}

const options = {
  plugins: {
    legend: { display: false },
  },
  maintainAspectRatio: false,
}

export default function RevenueChart() {
  return (
    <div className="chart-area">
      <Doughnut data={data} options={options} />
    </div>
  )
}
