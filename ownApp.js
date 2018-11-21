// BUDGET CONTROLLER
var budgetController = (function() {
	// 2.) Add the item to the budget controller
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	Expense.prototype.calculatePercentage = function() {
		if (data.totals.inc > 0)
		this.percentage = (this.value / data.totals.inc) * 100;
	}

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	var updateItemPercentages = function() {
		data.allItems.exp.forEach(function(cur) {
			cur.calculatePercentage();
		});
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1,
		itemPercentages: []
	};

	return {
		addItem: function(type, des, val) {
			var newItem, ID;

			//[1,2,3,4,5], next ID = 6
			//[1,2,4,6,8], next ID = 9 we will delete
			// ID = last ID + 1

			// Create new ID
			// KÉRDÉS!!!!!!!!!
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}
			else {
				ID = 0;
			}
			

			// Create new item based on "inc or exp"
			if (type === "exp") {
				newItem = new Expense(ID, des, val);

			}
			else if (type === "inc") {
				newItem = new Income(ID, des, val);
			}

			//Push it into our data structure
			data.allItems[type].push(newItem);


			updateItemPercentages();


			// return the new item
			return newItem;
		},

		calculateBudget: function() {

			// calculate total income and expense
			calculateTotal("exp");
			calculateTotal("inc");

			// calculate the budget: income - expense
			data.budget = data.totals.inc - data.totals.exp;
			// calculate the percentage spen

			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} 
			else {
				data.percentage = -1;
			}
		},

		/*getPercentage: function() {

		},*/

		deleteItem: function(type, id) {
			var ids, index
			// id = 6;
			// data.allItems[type][id];
			// ids = [1, 3, 4, **6**, 7];
			
			// index = **3**;

			var ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		
				updateItemPercentages();
		
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		testing: function() {
			console.log(data);
		}
	};

})();



// UI CONTROLLER - we write it here and THEN will call them in the GLOBAL contorller
var UIController = (function() {

	// CENTRAL PLACE to change class strings at one place
	var DOMstrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		// from controller
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		// Ui
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expenseLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container"
	};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function(obj, type) {
			var html, newHtml, element;
			// Create HTML strings with some placeholder text
			if (type === "inc") {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} 
			else if (type ==="exp") {
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			// Replace the placeholder text with some actual data

			newHtml = html.replace("%id%", obj.id);
			newHtml = newHtml.replace("%description%", obj.description);
			newHtml = newHtml.replace("%value%", obj.value);

			// Insert the HTML into the DOM
											
			document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
		},

		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);

			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
			
			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});
			fieldsArr[0].focus();
		},
		
		displayBudget: function(obj) {
			document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
			document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
			
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + " %";
			} 
			else {
				document.querySelector(DOMstrings.percentageLabel).textContent = "---";
			}
		},

		getDOMstrings: function() {
			return DOMstrings;
		}
	};
})();



// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
	// initialization
	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

		document.addEventListener("keypress", function(event) {
		if (event.keyCode === 13 || event.which === 13) {
			ctrlAddItem();
			}
		});


		document.querySelector(DOM.container).addEventListener("click", ctrlDelete);


	};


	// 2nd part of controller
	var updateBudget = function() {
		// 1.) Calculate the budget
		budgetCtrl.calculateBudget();
		// 2.) Return the budget
		var budget = budgetCtrl.getBudget();
		// 3.) Display the budget on the UI
		UICtrl.displayBudget(budget);
	};


	// 3rd part of controller
	var updatePercentages = function() {
		// 1.) calculate %'s

		// 2.) read the actual percentage from budegtCtrl

		// 3.) display the % in the UI
	};

	// 1st part of controller
	var ctrlAddItem = function() {
		var input, newItem;
		// 1.) Get the filled input data
		// ITT VEZETJÜK ÁT A UI-ból
		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// --- above ----- 2.) Add the item to the budget controller
			// ÁTVEZETÉS A BUDGET-BÓl
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3.) Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4.) Clear the fields
			UICtrl.clearFields();	

			// 5.) Calculate and update the budget
			updateBudget();
		}
	};


	var ctrlDelete = function(event) {
		var itemID, splitID

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		splitID = itemID.split("-");
		type = splitID[0];
		ID = parseFloat(splitID[1]);

		// 1.) Delete item from budgetCtrl
		budgetCtrl.deleteItem(type, ID);
		// 2.) Delete it from UI
		UICtrl.deleteListItem(itemID);
		// 3.) Update the budget
		updateBudget();
	};


	return {
		init: function() {
			setupEventListeners();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0 
			});
			console.log("Application Has Started!")
		}
	}
})(budgetController, UIController);

controller.init();