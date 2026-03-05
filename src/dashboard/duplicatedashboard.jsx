import { useState, useEffect } from "react";
import UnauthenticatedNavbar from "../components/unauthnavbar";
import { MdDelete } from "react-icons/md";
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DuplicateDashboard() {
  const [botid, setBotid] = useState('');
  const [expensesdata, setExpensesdata] = useState([]);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [recurringexpenses, setRecurringExpenses] = useState([]);
  const [remainders, setRemainders] = useState([]);
  const [totalexpenses, setTotalexpenses] = useState(0);
  const [piechartdata, setPiechartdata] = useState({});
  const [totcurrentMonthExpenses, settotcurrentMonthExpenses] = useState(null);

  const limit = 15;

  // Fetch expenses and recent transactions using botid
  const handleSubmitBotId = async () => {
    if (botid.trim() === '') {
      alert("Please enter a valid bot ID");
      return;
    }

    try {
      const backendURL = process.env.REACT_APP_URL;
      const response = await axios.post(`${backendURL}/userdash/getexpenses`, { botid, offset: 0, limit });

      const currentMonthExpenses=await axios.post(`${backendURL}/userdash/getexpenses/getCurrentMonthexpenses`,{botid});
      settotcurrentMonthExpenses(currentMonthExpenses.data.currentMonthExpenses);
      console.log("Current Month Expenses:", currentMonthExpenses.data.currentMonthExpenses);
      if (response.data.success) {
        setExpensesdata(response.data.expenses);
        console.log(response.data.expenses);
        setRecurringExpenses(response.data.recurringexpenses || []);
        console.log('recurring expenses:', response.data.recurringexpenses);
        setRemainders(response.data.remainders || []);
        console.log('remainders:', response.data.remainders);
        setTotalexpenses(response.data.totalexpenses);
        console.log("Total Expenses:", response.data.totalexpenses);

        setError(null);
        setOffset(limit);
        setHasMore(response.data.expenses.length === limit);
      } else {
        setExpensesdata([]);
        setError("User not found.");
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setError("Failed to fetch expenses. Please try again.");
      setExpensesdata([]);
      setHasMore(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      const backendURL = process.env.REACT_APP_URL;
      const response = await axios.post(`${backendURL}/userdash/getexpenses`, {
        botid,
        offset,
        limit,
      });

      if (response.data.success) {
        setExpensesdata((prev) => [...prev, ...response.data.expenses]);
        setOffset((prev) => prev + limit);
        setHasMore(response.data.expenses.length === limit);
      }
    } catch (error) {
      console.error("Error loading more:", error);
      setError("Something went wrong while loading more data.");
    }
  };

  const handleDeleteRecurringExpenses = async (index) => {
    const backendURL = process.env.REACT_APP_URL;
    try {
      const response = await axios.post(`${backendURL}/userdash/getexpenses/deleterecurringexpense`, { botid, index });
      if (response.data.success) {
        setRecurringExpenses((prev) => prev.filter((_, i) => i !== index));
        console.log("Recurring expense deleted successfully");
      }
    } catch (error) {
      setError("Failed to delete recurring expenses. Please try again.");
    }
  };

  const handleDeleteRemainders = async (index) => {
    const backendURL = process.env.REACT_APP_URL;
    try {
      const response = await axios.post(`${backendURL}/userdash/getexpenses/deleteremainders`, { botid, index });
      if (response.data.success) {
        setRemainders((prev) => prev.filter((_, i) => i !== index));
        console.log("Remainder deleted successfully");
      }
    } catch (error) {
      setError("Failed to delete reminder. Please try again.");
    }
  };

  const calculatePieChartData = () => {
    const categoryExpenses = expensesdata.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    const chartData = {
      labels: Object.keys(categoryExpenses),
      datasets: [{
        label: 'Expenses by Category',
        data: Object.values(categoryExpenses),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
      }],
    };
    setPiechartdata(chartData);
    console.log("Pie Chart Data:", chartData);
  };

  useEffect(() => {
    console.log("Total Expenses (updated):", totalexpenses);
  }, [totalexpenses]);

  useEffect(() => {
    if (expensesdata.length > 0) {
      calculatePieChartData();
    }
  }, [expensesdata]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UnauthenticatedNavbar />
      
      <div className="p-4 sm:p-6 mx-auto max-w-screen-xl">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4">Expense Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">To fetch your expenses, paste your Telegram bot ID:</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              name="botid"
              id="botid"
              value={botid}
              onChange={(e) => setBotid(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-400"
              placeholder="Enter your bot ID here..."
            />
            <button
              onClick={handleSubmitBotId}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
            >
              Submit
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-300 text-sm sm:text-base">
              {error}
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Recent Transactions</h2>
            </div>
            <div className="p-4 sm:p-6">
              {expensesdata.length > 0 ? (
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse hidden sm:table">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {expensesdata.map((expense, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {new Date(expense.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                              ₹{expense.amount}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              {expense.category}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Mobile Card Layout */}
                    <div className="sm:hidden space-y-4">
                      {expensesdata.map((expense, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              {new Date(expense.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              ₹{expense.amount}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {expense.category}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {hasMore && (
                    <div className="text-center mt-6">
                      <button
                        onClick={handleLoadMore}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 text-sm sm:text-base"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !error && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 dark:text-gray-500 text-2xl sm:text-3xl">
                      📊
                    </div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base">No expenses are added yet.</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right Column - Summary Cards */}
          <div className="space-y-4 sm:space-y-6">
            {/* Total Expenses Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Current Month Expenses</h3>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    ₹{totcurrentMonthExpenses}
                  </p>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl text-blue-500">💰</div>
              </div>
            </div>

            {/* Recurring Expenses Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🔄</span>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Recurring Expenses</h3>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {recurringexpenses.length > 0 ? (
                  <div className="space-y-3">
                    {recurringexpenses.map((expense, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white text-sm sm:text-base">₹{expense.amount}</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{expense.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{expense.date}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">{expense.frequency}</p>
                          </div>
                          <button className="text-lg sm:text-xl" onClick={() => handleDeleteRecurringExpenses(index)}>
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No recurring expenses</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reminders Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">⏰</span>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Reminders</h3>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {remainders.length > 0 ? (
                  <div className="space-y-3">
                    {remainders.map((reminder, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white text-sm sm:text-base">₹{reminder.amount}</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{reminder.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{reminder.date}</p>
                            <p className="text-xs text-orange-600 dark:text-orange-400">{reminder.duration} days</p>
                          </div>
                          <button className="text-lg sm:text-xl" onClick={() => handleDeleteRemainders(index)}>
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No reminders set</p>
                  </div>
                )}
              </div>
            </div>

            {/* Category-wise Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4">Expenses by Category</h3>
              {piechartdata && piechartdata.labels && piechartdata.labels.length > 0 ? (
                <div className="w-full max-w-[300px] sm:max-w-[400px] mx-auto">
                  <Pie data={piechartdata} />
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No category data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}