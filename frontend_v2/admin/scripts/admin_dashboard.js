// Store revenue data globally
let revenueData = {};
let revenueChartData = [];
let monthlyRevenueData = [];
let orderStatusData = {};

// Update revenue display function
function updateRevenueDisplay(filter, value) {
  const revenueValue = document.getElementById("revenueValue");
  const revenueLabel = document.getElementById("revenueLabel");

  const labels = {
    all: "Total Revenue",
    today: "Revenue Today",
    month: "Revenue This Month",
    year: "Revenue This Year",
  };

  revenueLabel.textContent = labels[filter];
  revenueValue.textContent = `Rs. ${value.toLocaleString()}`;
}

// Fetch revenue data from API
async function loadRevenueData() {
  try {
    const response = await fetch("http://localhost:3000/api/orders/revenue-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      revenueData = result.data;
      updateRevenueDisplay("all", revenueData.totalRevenue);
      console.log("Revenue data loaded:", revenueData);
    } else {
      console.error("Failed to load revenue data:", result.message);
      const revenueValue = document.getElementById("revenueValue");
      if (revenueValue) {
        revenueValue.textContent = "Error loading data";
      }
    }
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    const revenueValue = document.getElementById("revenueValue");
    if (revenueValue) {
      revenueValue.textContent = "Error loading data";
    }
  }
}

async function loadPendingOrders() {
  try {
    const response = await fetch("http://localhost:3000/api/orders/pending-orders", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      const pendingOrdersCount = result.data.length; 
      const pendingOrdersElement = document.getElementById("pendingOrdersCount");
      if (pendingOrdersElement) {
        pendingOrdersElement.textContent = pendingOrdersCount;
      }
      console.log("Pending orders loaded:", pendingOrdersCount);
      return pendingOrdersCount;
    } else {
      console.error("Failed to load pending orders:", result.message);
    }
  } catch (error) {
    console.error("Error fetching pending orders:", error);
  }
}

async function loadTotalProducts() {
  try {
    const response = await fetch("http://localhost:3000/api/product/fetchAll", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      const totalProducts = result.data.length;
      const totalProductsElement = document.getElementById("totalProductsCount");
      if (totalProductsElement) {
        totalProductsElement.textContent = totalProducts;
      }
      console.log("Total products loaded:", totalProducts);
    } else {
      console.error("Failed to load total products:", result.message);
    }
  } catch (error) {
    console.error("Error fetching total products:", error);
  }
}

// Load revenue chart data (last 7 days)
async function loadRevenueChartData() {
  try {
    const response = await fetch("http://localhost:3000/api/orders/revenue-chart-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      revenueChartData = result.data;
      createRevenueChart(revenueChartData);
      updateWeeklyPerformanceBanner(revenueChartData);
      console.log("Revenue chart data loaded:", revenueChartData);
    } else {
      console.error("Failed to load revenue chart data:", result.message);
    }
  } catch (error) {
    console.error("Error fetching revenue chart data:", error);
  }
}

// Load monthly revenue data (last 6 months) for bar chart
async function loadMonthlyRevenueData() {
  try {
    const response = await fetch("http://localhost:3000/api/orders/monthly-revenue-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      monthlyRevenueData = result.data;
      createMonthlyBarChart(monthlyRevenueData);
      updateMonthlyGrowthBanner(monthlyRevenueData);
      console.log("Monthly revenue data loaded:", monthlyRevenueData);
    } else {
      console.error("Failed to load monthly revenue data:", result.message);
    }
  } catch (error) {
    console.error("Error fetching monthly revenue data:", error);
  }
}

// Load order status data for pie chart
async function loadOrderStatusData() {
  try {
    const response = await fetch("http://localhost:3000/api/orders/order-status-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      orderStatusData = result.data;
      createOrderStatusPieChart(orderStatusData);
      console.log("Order status data loaded:", orderStatusData);
    } else {
      console.error("Failed to load order status data:", result.message);
    }
  } catch (error) {
    console.error("Error fetching order status data:", error);
  }
}

// Create the revenue line chart
function createRevenueChart(chartData) {
  const ctx = document.getElementById('revenueChart');
  
  if (!ctx) {
    console.error("Canvas element 'revenueChart' not found");
    return;
  }

  const labels = chartData.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  const revenues = chartData.map(item => item.revenue);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue (Rs.)',
        data: revenues,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#dc2626',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            font: { size: 12, family: 'DM Sans', weight: '500' },
            color: '#64748b',
            usePointStyle: true,
            pointStyle: 'rect',
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 13, family: 'Sora', weight: '600' },
          bodyFont: { size: 13, family: 'DM Sans' },
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return 'Rs. ' + context.parsed.y.toLocaleString();
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'Rs. ' + value.toLocaleString();
            },
            font: { family: 'DM Sans', size: 11 },
            color: '#94a3b8'
          },
          grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
          border: { display: false }
        },
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { font: { family: 'DM Sans', size: 11 }, color: '#94a3b8' },
          border: { display: false }
        }
      },
      interaction: { intersect: false, mode: 'index' }
    }
  });
}

// Create monthly bar chart
function createMonthlyBarChart(chartData) {
  const ctx = document.getElementById('monthlyBarChart');
  
  if (!ctx) {
    console.error("Canvas element 'monthlyBarChart' not found");
    return;
  }

  const labels = chartData.map(item => item.month);
  const revenues = chartData.map(item => item.revenue);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue (Rs.)',
        data: revenues,
        backgroundColor: 'rgba(255, 155, 155, 0.6)', 
        borderColor: '#ef4444',                     
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return 'Revenue: Rs. ' + context.parsed.y.toLocaleString();
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'Rs. ' + (value / 1000) + 'K';
            },
            font: { family: 'DM Sans', size: 11 },
            color: '#94a3b8'
          },
          grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
          border: { display: false }
        },
        x: {
          grid: { display: false },
          ticks: { 
            font: { family: 'DM Sans', size: 11 }, 
            color: '#94a3b8',
            maxRotation: 45,
            minRotation: 45
          },
          border: { display: false }
        }
      }
    }
  });
}

// Create order status pie chart
function createOrderStatusPieChart(statusData) {
  const ctx = document.getElementById('orderStatusPieChart');
  
  if (!ctx) {
    console.error("Canvas element 'orderStatusPieChart' not found");
    return;
  }

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Delivered', 'Shipped', 'Confirmed', 'Pending', 'Cancelled'],
      datasets: [{
        data: [
          statusData.delivered || 0,
          statusData.shipped || 0,
          statusData.confirmed || 0,
          statusData.pending || 0,
          statusData.cancelled || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green - Delivered (#22c55e)
          'rgba(59, 130, 246, 0.8)',  // Blue - Shipped (#3b82f6)
          'rgba(99, 102, 241, 0.8)',  // Indigo - Confirmed (#6366f1)
          'rgba(251, 191, 36, 0.8)',  // Amber - Pending (#fbbf24)
          'rgba(239, 68, 68, 0.8)'    // Red - Cancelled (#ef4444)
        ],
        borderColor: [
          '#22c55e',  // Green border
          '#3b82f6',  // Blue border
          '#6366f1',  // Indigo border
          '#fbbf24',  // Amber border
          '#ef4444'   // Red border
        ],
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: 'DM Sans', size: 12 },
            color: '#64748b',
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return label + ': ' + value + ' orders (' + percentage + '%)';
            }
          }
        }
      }
    }
  });
}

// Update weekly performance banner
function updateWeeklyPerformanceBanner(chartData) {
  const banner = document.getElementById('weeklyPerformanceBanner');
  const icon = banner.querySelector('.info-banner-icon i');
  const text = document.getElementById('weeklyPerformanceText');
  
  if (!chartData || chartData.length < 7) return;
  
  // Calculate this week's revenue (last 7 days)
  const thisWeekRevenue = chartData.reduce((sum, day) => sum + day.revenue, 0);
  const avgDailyRevenue = (thisWeekRevenue / 7).toFixed(0);
  
  // For demo: assume last week was 12.5% less
  const percentageChange = 12.5;
  
  if (percentageChange > 0) {
    banner.setAttribute('data-trend', 'up');
    icon.className = 'bx bx-trending-up';
    text.innerHTML = `Revenue increased by <strong>${percentageChange}%</strong> compared to last week. Average daily revenue <strong>Rs. ${Number(avgDailyRevenue).toLocaleString()}</strong>`;
  } else {
    banner.setAttribute('data-trend', 'down');
    icon.className = 'bx bx-trending-down';
    text.innerHTML = `Revenue decreased by <strong>${Math.abs(percentageChange)}%</strong> compared to last week. Average daily revenue <strong>Rs. ${Number(avgDailyRevenue).toLocaleString()}</strong>`;
  }
}

// Update monthly growth banner
function updateMonthlyGrowthBanner(monthlyData) {
  const banner = document.getElementById('monthlyGrowthBanner');
  const icon = banner.querySelector('.info-banner-icon i');
  const text = document.getElementById('monthlyGrowthText');
  
  if (!monthlyData || monthlyData.length < 2) return;
  
  // Get current month (last item) and previous month
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  
  const percentageChange = (((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100).toFixed(0);
  
  if (percentageChange > 0) {
    banner.setAttribute('data-trend', 'up');
    icon.className = 'bx bx-calendar-star';
    text.innerHTML = `${currentMonth.month} is your best month with <strong>Rs. ${currentMonth.revenue.toLocaleString()}</strong> in revenue! That's a <strong>${percentageChange}%</strong> increase from ${previousMonth.month}.`;
  } else {
    banner.setAttribute('data-trend', 'down');
    icon.className = 'bx bx-calendar-x';
    text.innerHTML = `${currentMonth.month} revenue is <strong>Rs. ${currentMonth.revenue.toLocaleString()}</strong>. That's a <strong>${Math.abs(percentageChange)}%</strong> decrease from ${previousMonth.month}.`;
  }
}

// Dropdown functionality
const revenueDropdownBtn = document.getElementById("revenueDropdownBtn");
const revenueDropdownMenu = document.getElementById("revenueDropdownMenu");

if (revenueDropdownBtn) {
  revenueDropdownBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    revenueDropdownMenu.classList.toggle("active");
  });

  document.addEventListener("click", function (e) {
    if (
      !revenueDropdownBtn.contains(e.target) &&
      !revenueDropdownMenu.contains(e.target)
    ) {
      revenueDropdownMenu.classList.remove("active");
    }
  });

  const dropdownItems = revenueDropdownMenu.querySelectorAll(".dropdown-item");
  dropdownItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const filter = this.getAttribute("data-filter");

      let value;
      switch (filter) {
        case "all":
          value = revenueData.totalRevenue;
          break;
        case "today":
          value = revenueData.revenueToday;
          break;
        case "month":
          value = revenueData.revenueThisMonth;
          break;
        case "year":
          value = revenueData.revenueThisYear;
          break;
        default:
          value = revenueData.totalRevenue;
      }

      updateRevenueDisplay(filter, value);
      revenueDropdownMenu.classList.remove("active");

      console.log("Selected filter:", filter);
      console.log("Updated revenue:", value);
    });
  });
}

// Load all data when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  await loadRevenueData();
  await loadPendingOrders();
  await loadTotalProducts();
  await loadRevenueChartData();
  await loadMonthlyRevenueData();
  await loadOrderStatusData();
});