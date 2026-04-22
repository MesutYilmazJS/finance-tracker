class FinanceTracker {
    constructor() {
        // Verileri al
        this.transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        this.budgets = JSON.parse(localStorage.getItem("budgets")) || {}; // Bütçeleri yerel depolamadan al

        // DOM elemanları
        this.form = document.getElementById("transaction-form");
        this.textInput = document.getElementById("text");
        this.amountInput = document.getElementById("amount");
        this.typeInputs = document.querySelectorAll('input[name="type"]');
        this.transactionList = document.getElementById("transaction-list");
        this.categoryFilter = document.getElementById("category-filter"); // Kategori filtreleme elemanı
        this.filterButton = document.getElementById("filter-button"); // Filtreleme butonu
        this.filterModal = document.getElementById("filter-modal"); // Filtre modalı
        this.cancelFilterButton = document.getElementById("cancel-filter"); // Modalı kapama butonu
        this.filterForm = document.getElementById("filter-form"); // Filtre formu
        this.minPriceInput = document.getElementById("min-price");
        this.maxPriceInput = document.getElementById("max-price");
        this.transactionTypeInputs = document.querySelectorAll('input[name="transaction-type"]');
        this.startDateInput = document.getElementById("start-date");
        this.endDateInput = document.getElementById("end-date");
        this.filterCategory = document.getElementById("filter-category");

        // Modal
        this.modal = document.getElementById("modal");
        this.openModalBtn = document.getElementById("openModalBtn");
        this.cancelModalBtn = document.getElementById("cancelModalBtn");

        // Grafik
        this.chartCanvas = document.getElementById("pieChart");
        this.chart = null;
        this.darkModeToggle = document.getElementById("dark-mode-toggle");
        this.totalIncome = document.getElementById("total-income");
        this.totalExpense = document.getElementById("total-expense");
        this.netIncome = document.getElementById("net-income");

        // Bütçe Alanları
        this.budgetInput = document.getElementById("budget-input");
        this.categoryInput = document.getElementById("category-input");
        this.saveBudgetBtn = document.getElementById("save-budget-btn");
        this.budgetWarning = document.getElementById("budget-warning");

        // Bütçe Grafiği
        this.budgetChartCanvas = document.getElementById("budgetChart");
        this.budgetChart = null;
        // Bütçe Bilgisi
        this.budgetSummary = document.getElementById("budget-summary");

        // Olayları başlat
        this.init();
    }


    init() {
        this.form.addEventListener("submit", (e) => this.addTransaction(e));
        this.saveBudgetBtn?.addEventListener("click", () => this.saveBudget());
        this.openModalBtn?.addEventListener("click", () => this.modal.classList.remove("hidden"));
        this.cancelModalBtn?.addEventListener("click", () => this.modal.classList.add("hidden"));
        this.categoryFilter?.addEventListener("change", (e) => this.filterByCategory(e.target.value)); // Filtreleme olayını ekle
        // Filtreleme işlemi başlatma
        this.filterButton?.addEventListener("click", () => this.openFilterModal());
        this.cancelFilterButton?.addEventListener("click", () => this.closeFilterModal());
        this.filterForm?.addEventListener("submit", (e) => this.applyFilters(e));
        this.modal?.addEventListener("click", (e) => {
            if (e.target === this.modal) this.modal.classList.add("hidden");
        });
        this.filterModal?.addEventListener("click", (e) => {
            if (e.target === this.filterModal) this.closeFilterModal();
        });

        // Eğer yerel depolamada karanlık mod aktifse, bunu uygula
        const isDarkMode = localStorage.getItem("darkMode") === "true";
        if (isDarkMode) {
            document.body.classList.add("dark");
        }
        if (this.darkModeToggle) {
            this.darkModeToggle.checked = isDarkMode;
        }

        this.darkModeToggle?.addEventListener("change", this.toggleDarkMode);
        this.renderTransactions(); // İlk render
        this.updateChart(); // Grafik güncelle
        this.updateBudgetChart(); // Bütçe grafiğini güncelle
        this.updateBudgetSummary(); // Bütçe bilgilerini güncelle
    }
    openFilterModal() {
        this.filterModal.classList.remove("hidden"); // Modal'ı aç
    }

    closeFilterModal() {
        this.filterModal.classList.add("hidden"); // Modal'ı kapat
    }
    applyFilters(e) {
        e.preventDefault();

        const minPrice = this.minPriceInput.value;
        const maxPrice = this.maxPriceInput.value;
        const transactionType = Array.from(this.transactionTypeInputs).find(input => input.checked)?.value;
        const startDate = this.startDateInput.value;
        const endDate = this.endDateInput.value;
        const filterCategory = this.filterCategory.value;

        this.filterTransactions(minPrice, maxPrice, transactionType, startDate, endDate, filterCategory);

        this.closeFilterModal(); // Modal'ı kapat
    }
    filterTransactions(minPrice, maxPrice, transactionType, startDate, endDate, filterCategory) {
        let filteredTransactions = this.transactions;

        // Fiyat aralığına göre filtreleme
        if (minPrice) filteredTransactions = filteredTransactions.filter(tx => tx.amount >= minPrice);
        if (maxPrice) filteredTransactions = filteredTransactions.filter(tx => tx.amount <= maxPrice);

        // Gelir / Gider türüne göre filtreleme
        if (transactionType) filteredTransactions = filteredTransactions.filter(tx => tx.type === transactionType);

        // Tarih aralığına göre filtreleme
        if (startDate) filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date) >= new Date(startDate));
        if (endDate) filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date) <= new Date(endDate));

        // Kategoriye göre filtreleme
        if (filterCategory && filterCategory !== "all") {
            filteredTransactions = filteredTransactions.filter(tx => tx.category === filterCategory);
        }

        // Filtrelenmiş işlemleri render et
        this.renderTransactions("all", filteredTransactions);
    }
    // Karanlık mod değiştirme fonksiyonu
    toggleDarkMode = () => {
        document.body.classList.toggle("dark");

        // Durumu yerel depolamaya kaydet
        const isDarkMode = document.body.classList.contains("dark");
        localStorage.setItem("darkMode", isDarkMode.toString());
        this.updateChart();
        this.updateBudgetChart();
    };
    addTransaction(e) {
        e.preventDefault();

        const selectedType = Array.from(this.typeInputs).find((el) => el.checked).value;
        const date = document.getElementById("transaction-date").value;
        const category = document.getElementById("category").value;

        const transaction = {
            id: Date.now(),
            text: this.textInput.value.trim(),
            amount: parseFloat(this.amountInput.value),
            type: selectedType,
            date: date,
            category: category,
        };

        if (!transaction.text || isNaN(transaction.amount) || !transaction.date) return;

        this.transactions.push(transaction);
        this.saveTransactions();
        this.renderTransactions();
        this.updateChart();
        this.updateBudgetSummary(); // Bütçe özetini güncelle

        // Bütçeyi kontrol et
        this.checkBudgetAlert(transaction.category);

        this.form.reset();
        this.modal.classList.add("hidden");
    }
    // Filtreleme Fonksiyonu
    filterByCategory(category) {
        this.renderTransactions(category); // Kategoriye göre filtrele ve render et
    }


    deleteTransaction(id) {
        this.transactions = this.transactions.filter((tx) => tx.id !== id);
        this.saveTransactions();
        this.renderTransactions();
        this.updateChart();
        this.updateBudgetSummary(); // Bütçe özetini güncelle
    }


    renderTransactions(category = "all", filteredTransactions) {
        this.transactionList.innerHTML = "";

        const transactionItems = filteredTransactions ? filteredTransactions : this.transactions.filter((tx) =>
            category === "all" ? true : tx.category === category
        );
        if (transactionItems.length === 0) {
            const li = document.createElement("li");
            li.className = "empty-state";

            li.innerHTML = `
            <div>
              <strong>Henüz işlem görünmüyor</strong>
              <div>Filtreleri temizleyebilir veya yeni bir kayıt ekleyebilirsin.</div>
            </div>`;
            this.transactionList.appendChild(li);
            this.updateTotals();
            return;
        }

        transactionItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        transactionItems.forEach((tx) => {
            const li = document.createElement("li");
            li.className = "transaction-item";

            li.innerHTML = `
            <div class="transaction-main">
              <div class="transaction-title-row">
                <span class="transaction-title">${tx.text}</span>
                <span class="transaction-badge ${tx.type}">
                  ${tx.type === "income" ? "+" : "-"}₺${tx.amount.toFixed(2)}
                </span>
              </div>
              <div class="transaction-date">${new Date(tx.date).toLocaleDateString("tr-TR")}</div>
              <div class="transaction-category">${this.formatCategory(tx.category)}</div>
            </div>
            <button class="text-button">Sil</button>
          `;
            li.querySelector("button").addEventListener("click", () => this.deleteTransaction(tx.id));
            this.transactionList.appendChild(li);
        });

        this.updateTotals();
    }

    updateTotals() {
        let income = 0;
        let expense = 0;

        this.transactions.forEach((tx) => {
            if (tx.type === "income") {
                income += tx.amount;
            } else {
                expense += tx.amount;
            }
        });

        this.totalIncome.innerHTML = `₺${income.toFixed(2)}`;
        this.totalExpense.innerHTML = `₺${expense.toFixed(2)}`;
        this.netIncome.innerHTML = `₺${(income - expense).toFixed(2)}`;
    }

    getThemeColors() {
        const styles = getComputedStyle(document.body);

        return {
            text: styles.getPropertyValue("--text").trim(),
            muted: styles.getPropertyValue("--muted").trim(),
            border: styles.getPropertyValue("--border").trim(),
            income: styles.getPropertyValue("--income").trim(),
            expense: styles.getPropertyValue("--expense").trim(),
            brand: styles.getPropertyValue("--brand").trim(),
            accent: styles.getPropertyValue("--accent").trim(),
        };
    }
    // Kategoriyi daha anlaşılır bir şekilde formatla
    formatCategory(category) {
        const categories = {
            food: "Yiyecek",
            transport: "Ulaşım",
            entertainment: "Eğlence",
            other: "Diğer",
        };
        return categories[category] || "Bilinmeyen";
    }
    // Bütçe kaydetme fonksiyonu
    saveBudget() {
        const budgetValue = parseFloat(this.budgetInput.value);
        const category = this.categoryInput.value;

        if (isNaN(budgetValue) || budgetValue <= 0) {
            alert("Geçerli bir bütçe girin.");
            return;
        }

        this.budgets[category] = budgetValue;
        localStorage.setItem("budgets", JSON.stringify(this.budgets));
        this.checkBudgetAlert(category); // Kaydettikten sonra uyarıyı kontrol et
        this.updateBudgetChart(); // Grafik güncelle
        this.updateBudgetSummary(); // Bütçe özetini güncelle
        this.budgetInput.value = "";
    }
    updateBudgetSummary() {
        this.budgetSummary.innerHTML = ''; // Önce mevcut içeriği temizle

        if (Object.keys(this.budgets).length === 0) {
            const emptyCard = document.createElement("div");
            emptyCard.className = "budget-category";
            emptyCard.innerHTML = `
                <p class="category-name">Hazır Başlangıç</p>
                <p class="category-amount">Henüz bütçe eklenmedi</p>
                <p class="category-progress">İlk kategori bütçeni tanımlayarak bu alanı doldurabilirsin.</p>
            `;
            this.budgetSummary.appendChild(emptyCard);
            return;
        }

        // Her kategori için bütçeyi ve harcamayı göster
        for (const category in this.budgets) {
            const budget = this.budgets[category];
            const totalCategoryExpense = this.transactions
                .filter((tx) => tx.category === category && tx.type === "expense")
                .reduce((acc, tx) => acc + tx.amount, 0);

            const budgetPercentage = (totalCategoryExpense / budget) * 100;
            const displayPercentage = Math.max(budgetPercentage, 0);

            // Renkli arka plan için class belirle
            let budgetClass = '';
            if (budgetPercentage > 100) {
                budgetClass = 'exceeded'; // Bütçe aşıldığında kırmızı
            } else if (budgetPercentage < 80) {
                budgetClass = 'low'; // Yüzde 80'in altında olduğunda yeşil
            }

            // Grid öğesini oluştur
            const budgetCategoryElement = document.createElement("div");
            budgetCategoryElement.className = `budget-category ${budgetClass}`;

            budgetCategoryElement.innerHTML = `
                <p class="category-name">${this.formatCategory(category)}</p>
                <p class="category-amount">₺${budget.toFixed(2)} / ₺${totalCategoryExpense.toFixed(2)}</p>
                <div class="budget-bar">
                    <div class="budget-bar-background">
                        <div class="budget-bar-foreground" style="width: ${Math.min(budgetPercentage, 100)}%;"></div>
                    </div>
                </div>
                <p class="category-progress">${displayPercentage.toFixed(2)}% harcandı</p>
            `;

            this.budgetSummary.appendChild(budgetCategoryElement);
        }
    }


    // Bütçe grafiğini güncelleme
    updateBudgetChart() {
        const colors = this.getThemeColors();
        const categories = Object.keys(this.budgets);
        const budgetData = categories.map((category) => this.budgets[category] || 0);
        const expenseData = categories.map((category) => {
            return this.transactions
                .filter((tx) => tx.category === category && tx.type === "expense")
                .reduce((acc, tx) => acc + tx.amount, 0);
        });

        const chartData = categories.map((category, index) => ({
            category: category,
            budget: budgetData[index],
            expense: expenseData[index],
        }));

        const chartLabels = chartData.map((data) => this.formatCategory(data.category));
        const chartBudgets = chartData.map((data) => data.budget);
        const chartExpenses = chartData.map((data) => data.expense);

        if (this.budgetChart) this.budgetChart.destroy();

        this.budgetChart = new Chart(this.budgetChartCanvas, {
            type: "bar",
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: "Bütçe",
                        data: chartBudgets,
                        backgroundColor: colors.brand,
                        borderRadius: 10,
                    },
                    {
                        label: "Harcamalar",
                        data: chartExpenses,
                        backgroundColor: colors.expense,
                        borderRadius: 10,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: colors.muted,
                        },
                        grid: {
                            color: colors.border,
                        },
                    },
                    x: {
                        ticks: {
                            color: colors.muted,
                        },
                        grid: {
                            display: false,
                        },
                    },
                },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            color: colors.text,
                        },
                    },
                },
            },
        });
    }
    // Bütçe kontrolü ve toast uyarısı
    checkBudgetAlert(category) {
        const totalCategoryExpense = this.transactions
            .filter((tx) => tx.category === category && tx.type === "expense")
            .reduce((acc, tx) => acc + tx.amount, 0);

        const budget = this.budgets[category] || 0;

        if (budget <= 0) return;

        if (totalCategoryExpense > budget) {
            this.showToast(); // Uyarıyı göster
        }
    }
    // Toast gösterme fonksiyonu
    showToast() {
        const toast = this.budgetWarning;
        toast.classList.remove("hidden");
        toast.classList.add("show");

        // Toast mesajını 3 saniye sonra gizle
        setTimeout(() => {
            toast.classList.remove("show");
            toast.classList.add("hidden");
        }, 3000); // 3 saniye sonra gizle
    }
    filterByPeriod(period) {
        const now = new Date();
        return this.transactions.filter((tx) => {
            const txDate = new Date(tx.date);
            if (period === "month") {
                return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            } else if (period === "week") {
                const startOfWeek = now.getDate() - now.getDay(); // Haftanın ilk günü
                const endOfWeek = startOfWeek + 6; // Haftanın son günü
                return txDate >= new Date(now.setDate(startOfWeek)) && txDate <= new Date(now.setDate(endOfWeek));
            }
            return false;
        });
    }

    updateChart() {
        const colors = this.getThemeColors();
        const income = this.transactions
            .filter((tx) => tx.type === "income")
            .reduce((acc, tx) => acc + tx.amount, 0);

        const expense = this.transactions
            .filter((tx) => tx.type === "expense")
            .reduce((acc, tx) => acc + tx.amount, 0);

        if (this.chart) this.chart.destroy();

        this.chart = new Chart(this.chartCanvas, {
            type: "doughnut",
            data: {
                labels: ["Gelir", "Gider"],
                datasets: [
                    {
                        data: [income, expense],
                        backgroundColor: [colors.income, colors.expense],
                        borderColor: colors.border,
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: colors.text,
                        },
                    },
                },
            },
        });
    }

    saveTransactions() {
        localStorage.setItem("transactions", JSON.stringify(this.transactions));
    }


}

// Uygulamayı başlat
document.addEventListener("DOMContentLoaded", () => {
    new FinanceTracker();
});
