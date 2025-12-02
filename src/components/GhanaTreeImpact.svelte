<script lang="ts">
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";
  import type { Chart as ChartType } from "chart.js/auto";

  // DOM references
  let canvas0: HTMLCanvasElement;
  let canvas1: HTMLCanvasElement;
  let canvas2: HTMLCanvasElement;
  let canvas3: HTMLCanvasElement;
  let canvas4: HTMLCanvasElement;
  let canvas5: HTMLCanvasElement;

  // Active chart index
  let activeIndex = $state(0);

  // Chocolate color palette
  const chocolateColors = {
    dark: '#3E2723',
    milk: '#6D4C41',
    medium: '#8D6E63',
    light: '#A1887F',
    cream: '#BCAAA4'
  };

  // Data
  const yearlyData = {
    labels: ['2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010',
             '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020',
             '2021', '2022'],
    values: [43676, 78393, 24946, 17628, 41339, 27143, 40184, 37826, 38256, 19476,
             36202, 36630, 81203, 120207, 57391, 119243, 115332, 151531, 88265, 136614,
             101413, 118644]
  };

  const valuesK = yearlyData.values.map(v => Math.round(v / 1000));

  // Calculate cumulative
  let cumulative = 0;
  const cumulativeValues = yearlyData.values.map(v => {
    cumulative += v;
    return Math.round(cumulative / 1000);
  });

  // Period data
  const periodLabels = ['2001-2005', '2006-2010', '2011-2015', '2016-2020', '2021-2022'];
  const periodValues = [
    Math.round((43676 + 78393 + 24946 + 17628 + 41339) / 1000),
    Math.round((27143 + 40184 + 37826 + 38256 + 19476) / 1000),
    Math.round((36202 + 36630 + 81203 + 120207 + 57391) / 1000),
    Math.round((119243 + 115332 + 151531 + 88265 + 136614) / 1000),
    Math.round((101413 + 118644) / 1000)
  ];
  const periodColors = [
    'rgba(62, 39, 35, 0.9)',
    'rgba(93, 64, 55, 0.85)',
    'rgba(141, 110, 99, 0.85)',
    'rgba(161, 136, 127, 0.8)',
    'rgba(188, 170, 164, 0.75)'
  ];

  // Threshold data
  const thresholdLabels = ['0%', '10%', '30%', '50%', '75%'];
  const thresholdValues = [145, 145, 119, 71, 2];
  const thresholdColors = [
    '#3E2723',
    '#5D4037',
    '#8D6E63',
    '#A1887F',
    '#D7CCC8'
  ];

  // Peak and valley data
  const peakValleyLabels = ['2002', '2003', '2004', '2010', '2013', '2014', '2016', '2017', '2018', '2020'];
  const peakValleyValues = [78, 25, 18, 19, 81, 120, 119, 115, 152, 137];
  const peakValleyColors = ['#3E2723', '#A1887F', '#A1887F', '#A1887F', '#3E2723', '#3E2723', '#3E2723', '#3E2723', '#3E2723', '#3E2723'];

  const formatHa = (value: number) => `${Math.round(value)}k ha`;

  const charts: ChartType[] = [];

  function showChart(index: number) {
    activeIndex = index;
    // Update the selected chart
    setTimeout(() => {
      if (charts[index]) {
        charts[index].update();
      }
    }, 50);
  }

  onMount(() => {
    // Create gradient for peak/valley chart
    const peakGradient = canvas5.getContext('2d')!.createLinearGradient(0, 0, 0, 400);
    peakGradient.addColorStop(0, 'rgba(62, 39, 35, 0.35)');
    peakGradient.addColorStop(1, 'rgba(189, 163, 150, 0.05)');

    // Chart 1: Annual Bar Chart
    charts[0] = new Chart(canvas0, {
      type: 'bar',
      data: {
        labels: yearlyData.labels,
        datasets: [{
          label: 'Loss (1000 ha)',
          data: valuesK,
          backgroundColor: chocolateColors.medium,
          borderColor: chocolateColors.dark,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Loss (1000 ha)' }
          }
        }
      }
    });

    // Chart 2: Cumulative Area Chart
    charts[1] = new Chart(canvas1, {
      type: 'line',
      data: {
        labels: yearlyData.labels,
        datasets: [{
          label: 'Cumulative Loss (1000 ha)',
          data: cumulativeValues,
          backgroundColor: 'rgba(109, 76, 65, 0.3)',
          borderColor: chocolateColors.dark,
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Cumulative Loss (1000 ha)' }
          }
        }
      }
    });

    // Chart 3: Period Column Chart
    charts[2] = new Chart(canvas2, {
      type: 'bar',
      data: {
        labels: periodLabels,
        datasets: [{
          label: 'Period Loss (1000 ha)',
          data: periodValues,
          backgroundColor: periodColors,
          borderColor: chocolateColors.dark,
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 0.65
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Loss (1000 ha)' }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = typeof context.parsed === 'object' ? context.parsed.y : context.parsed;
                return formatHa(value);
              }
            }
          }
        }
      }
    });

    // Chart 4: Horizontal Bars for Thresholds
    charts[3] = new Chart(canvas3, {
      type: 'bar',
      data: {
        labels: thresholdLabels,
        datasets: [{
          label: 'Loss (1000 ha)',
          data: thresholdValues,
          backgroundColor: thresholdColors,
          borderColor: chocolateColors.dark,
          borderWidth: 1,
          borderRadius: 12,
          barPercentage: 0.55
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${formatHa(context.parsed.x)}`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: 'Loss (1000 ha)' },
            ticks: {
              callback: (value) => `${value}k`
            }
          }
        }
      }
    });

    // Chart 5: Line Chart with Points
    charts[4] = new Chart(canvas4, {
      type: 'line',
      data: {
        labels: yearlyData.labels,
        datasets: [{
          label: 'Loss (1000 ha)',
          data: valuesK,
          backgroundColor: chocolateColors.medium,
          borderColor: chocolateColors.dark,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: chocolateColors.medium,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Loss (1000 ha)' }
          }
        }
      }
    });

    // Chart 6: Peak vs Valley Area Line
    charts[5] = new Chart(canvas5, {
      type: 'line',
      data: {
        labels: peakValleyLabels,
        datasets: [{
          label: 'Loss (1000 ha)',
          data: peakValleyValues,
          backgroundColor: peakGradient,
          borderColor: chocolateColors.dark,
          borderWidth: 2,
          pointBackgroundColor: peakValleyColors,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 160,
            title: { display: true, text: 'Loss (1000 ha)' },
            ticks: {
              stepSize: 40,
              callback: (value) => `${value}k`
            }
          },
          x: {
            title: { display: true, text: 'Year' }
          }
        }
      }
    });

    // Cleanup on unmount
    return () => {
      charts.forEach(chart => chart.destroy());
    };
  });
</script>

<section class="ghana-impact-section" aria-label="Ghana tree cover loss analysis">
  <div class="container">
    <h1>🌳 Ghana Tree Cover Loss Analysis 🍫</h1>
    <p class="subtitle">Sweet data, bitter reality: 30% canopy density threshold (2001-2022)</p>

    <div class="button-container">
      <button
        class="chart-button"
        class:active={activeIndex === 0}
        on:click={() => showChart(0)}
      >
        Annual Loss Timeline
      </button>
      <button
        class="chart-button"
        class:active={activeIndex === 1}
        on:click={() => showChart(1)}
      >
        Cumulative Loss Growth
      </button>
      <button
        class="chart-button"
        class:active={activeIndex === 2}
        on:click={() => showChart(2)}
      >
        5-Year Period Totals
      </button>
      <button
        class="chart-button"
        class:active={activeIndex === 3}
        on:click={() => showChart(3)}
      >
        Threshold Sensitivity
      </button>
      <button
        class="chart-button"
        class:active={activeIndex === 4}
        on:click={() => showChart(4)}
      >
        Trend Smoother
      </button>
      <button
        class="chart-button"
        class:active={activeIndex === 5}
        on:click={() => showChart(5)}
      >
        Peaks vs Valleys
      </button>
    </div>

    <div class="visuals-layout">
      <div class="chart-container">
        <!-- Chart 1: Annual Loss -->
        <div class="chart-view" class:active={activeIndex === 0}>
          <h2 class="chart-title">🍫 Annual Tree Cover Loss (2001-2022)</h2>
          <p class="chart-description">Year-by-year forest loss in thousands of hectares</p>
          <div class="canvas-wrapper">
            <canvas bind:this={canvas0}></canvas>
          </div>
        </div>

        <!-- Chart 2: Cumulative Loss -->
        <div class="chart-view" class:active={activeIndex === 1}>
          <h2 class="chart-title">🍫 Cumulative Forest Loss Over Time</h2>
          <p class="chart-description">Total accumulated tree cover loss since 2001</p>
          <div class="canvas-wrapper">
            <canvas bind:this={canvas1}></canvas>
          </div>
        </div>

        <!-- Chart 3: Period Comparison -->
        <div class="chart-view" class:active={activeIndex === 2}>
          <h2 class="chart-title">🍫 Loss Trends by 5-Year Periods</h2>
          <p class="chart-description">Comparing forest loss across different time periods</p>
          <div class="canvas-wrapper">
            <canvas bind:this={canvas2}></canvas>
          </div>
        </div>

        <!-- Chart 4: Threshold Impact -->
        <div class="chart-view" class:active={activeIndex === 3}>
          <h2 class="chart-title">🍫 Impact of Canopy Density Threshold (2022)</h2>
          <p class="chart-description">How different tree density thresholds affect reported loss</p>
          <div class="canvas-wrapper">
            <canvas bind:this={canvas3}></canvas>
          </div>
        </div>

        <!-- Chart 5: Trend Line -->
        <div class="chart-view" class:active={activeIndex === 4}>
          <h2 class="chart-title">🍫 Annual Loss Trend Line</h2>
          <p class="chart-description">Smooth trend showing the pattern of deforestation</p>
          <div class="canvas-wrapper">
            <canvas bind:this={canvas4}></canvas>
          </div>
        </div>

        <!-- Chart 6: Peaks vs Valleys -->
        <div class="chart-view" class:active={activeIndex === 5}>
          <h2 class="chart-title">🍫 Peak vs Valley Years</h2>
          <p class="chart-description">Comparing years with highest and lowest deforestation</p>
          <div class="canvas-wrapper">
            <canvas bind:this={canvas5}></canvas>
          </div>
        </div>
      </div>

      <div class="insights">
        <h3>📊 Key Insights</h3>
        <ul>
          <li><strong>Total Loss:</strong> Over 1.5 million hectares lost since 2001</li>
          <li><strong>Worst Year:</strong> 2018 with 151,531 ha lost</li>
          <li><strong>Best Year:</strong> 2004 with only 17,628 ha lost</li>
          <li><strong>Recent Trend:</strong> High variability with significant losses continuing</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Source+Sans+3:wght@400;500;600&display=swap');

  .ghana-impact-section {
    font-family: 'Source Sans 3', system-ui, -apple-system, sans-serif;
    padding: 4rem 2.5rem 6rem;
    background: none;
    position: relative;
    color: rgba(255, 248, 240, 0.94);
    overflow-x: hidden;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  h1 {
    font-family: 'Playfair Display', 'Times New Roman', serif;
    color: rgba(255, 248, 240, 0.96);
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 1rem;
    letter-spacing: 0.04em;
  }

  .subtitle {
    color: rgba(255, 248, 240, 0.8);
    text-align: center;
    margin-bottom: 2rem;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .button-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .chart-button {
    padding: 0.75rem 1.5rem;
    background-color: #A1887F;
    color: #3E2723;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    white-space: nowrap;
  }

  .chart-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  .chart-button.active {
    background-color: #3E2723;
    color: #FFF8E1;
    font-weight: bold;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  .visuals-layout {
    display: flex;
    gap: 2rem;
    align-items: stretch;
  }

  .chart-container {
    background-color: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 8px 16px rgba(62, 39, 35, 0.15);
    border: 3px solid #8D6E63;
    flex: 2;
    position: relative;
    overflow: hidden;
  }

  .chart-container::after {
    content: '';
    position: absolute;
    width: 180px;
    height: 180px;
    top: -60px;
    right: -60px;
    background: radial-gradient(circle, rgba(161, 136, 127, 0.25), transparent 60%);
    pointer-events: none;
  }

  .chart-title {
    color: #3E2723;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
    font-family: 'Playfair Display', 'Times New Roman', serif;
  }

  .chart-description {
    color: #6D4C41;
    margin-bottom: 1.5rem;
    font-style: italic;
  }

  .canvas-wrapper {
    position: relative;
    height: 400px;
    margin-bottom: 1rem;
  }

  .insights {
    padding: 1.1rem 1.2rem;
    background-color: #BCAAA4;
    border-radius: 10px;
    color: #3E2723;
    flex: 0 0 280px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 220px;
    max-width: 320px;
    box-shadow: inset 0 0 0 1px rgba(62, 39, 35, 0.1), 0 8px 16px rgba(0, 0, 0, 0.25);
    background-image: linear-gradient(145deg, rgba(255,255,255,0.2), transparent);
  }

  .insights h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .insights ul {
    line-height: 1.8;
    margin-left: 1.5rem;
  }

  .chart-view {
    display: none;
  }

  .chart-view.active {
    display: block;
  }

  @media (max-width: 960px) {
    .visuals-layout {
      flex-direction: column;
    }

    .insights {
      margin-top: 1.5rem;
      max-width: 100%;
    }
  }

  @media (max-width: 640px) {
    .ghana-impact-section {
      padding: 1.5rem;
    }

    h1 {
      font-size: 1.8rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .chart-container {
      padding: 1.5rem;
    }

    .chart-button {
      padding: 0.6rem 1.2rem;
      font-size: 0.85rem;
    }
  }
</style>
