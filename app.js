// Create modules by using IIFE and Closure

/**********************************************/
// Budget Controller
var budgetController = (function() {

  // Function constructor is usefull when we need to initiate lots of objects
  // We need places to store exp or inc with a unique id, a description and a value.
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // Calculate percentage
  Expense.prototype.calPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  // Return percentage
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
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
    // when there isn't any inc or exp, percentage doesn't exit
    percentage: -1
  };

  var calculateTotal = function(type) {
    var sum = 0;

    // The forEach() method executes a provided function once for each array element.
    // Iteration is the act of repeating a process
    data.allItems[type].forEach(function(currValue) {
      sum += currValue.value;
    });

    // Assign sum to either inc or exp in data.totals
    data.totals[type] = sum;
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      // Create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      // Push it into data structure
      data.allItems[type].push(newItem);

      // Return newItem
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      // id = 6
      // data.allItems[type][id]
      // ids = [1 2 4 6 8]
      // index = 3

      // Find ids of all elements in allItems.inc or allItems.exp
      // array.map(function callback(currentValue, index, array) {}
      // The map() method creates a new array with the results of calling a provided function on every element in the calling array.
      ids = data.allItems[type].map(function(currentValue) {
        return currentValue.id;
      });
      // Find the index of target 'id' in the ids array
      index = ids.indexOf(id);

      // Delete item
      if (index !== -1) {
        // The splice() method changes the contents of an array by removing existing elements and/or adding new elements.
        // array.splice(start, deleteCount)
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    // Calculate percentage for every expense
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(current) {
        current.calPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      // Get all percentages and put them into allPercentages array, then return the array.
      var allPercentages = data.allItems.exp.map(function(current) {
        return current.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function() {
      return data;
    }
  };
})();


/**********************************************/
// User Interface Controller
var UIController = (function() {

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensePercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numSplit, integer, decimal;

     // The Math.abs() function returns the absolute value of a number
     num = Math.abs(num);

     // Exactly 2 decimal points
     num = num.toFixed(2);

     // Comma seperating thousands
     numSplit = num.split('.');
     integer = numSplit[0];
     if (integer.length > 3) {
       integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, 3);
     }

     decimal = numSplit[1];

     // + or - before number
     return (type === 'exp' ? '- ' : '+ ') + integer + '.' + decimal;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    // Get value from the input fields
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        // Convert string to float to calculate budget
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },

    // Add item to inc or exp column
    addListItem: function(obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === 'inc') {
        // Set element equal to '.income__list'
        element = DOMstrings.incomeContainer;

        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        // Set element equal to '.expenses__list'
        element = DOMstrings.expensesContainer;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder test with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID) {
      var element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    // Clear HTML fields
    clearFields: function() {
      var fields, fieldsArr;

      // querySelectorAll return a list, which is similar to array, but doesn't have useful methods like array
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      // How to convert a list to an array
      /* slice() return a copy of an array that it calls on
       * Usually, we use this method on an array to return another array
       * In this case we will trick the slice() method that we give it an array, so it will return an array
       * We will call the slice() method by using the call() method. Then pass the fields variable into it , so it becomes the 'this' variable
       * To access slice() method, we use function constructor Array. It's because all the methods that an array inherits from the function constructor, are in the array prototype properties. */
      fieldsArr = Array.prototype.slice.call(fields);

      // Use forEach() to loop over an array
      fieldsArr.forEach(function(currentValue, index, array) {
        currentValue.value = "";
      });

      // Set focus on the first element
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      // Get value from getBudget() in budgetController
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      // Display percentage
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {
      // nodeList
      var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function() {
      var now, month, months, year;
      now = new Date();

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
    },

    // Add red-focus class to type, description, value and submit button, when type change from + to -
    changeType: function() {
      var fields;

      fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue
      );

      nodeListForEach(fields, function(current) {
        current.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputButton).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();


/**********************************************/
// Controller
var controller = (function(budgetCrl, UICrl) {

  var setupEventListeners = function() {
    var DOM = UICrl.getDOMstrings();

    document.querySelector(DOM.inputButton).addEventListener('click', crlAddItem);
    // Add all functionalities of add__btn to 'return key'
    document.addEventListener('keypress', function(event) {
      if (event.keycode === 13 || event.which === 13) {
        crlAddItem();
      }
    });

    // Use event delegation on parent container
    document.querySelector(DOM.container).addEventListener('click', crlDeleteItem);

    // Change type from + to -
    document.querySelector(DOM.inputType).addEventListener('change', UICrl.changeType);
  };

  var updateBudget = function() {
    var budget;

    // 1. Calculate the budget
    budgetCrl.calculateBudget();

    // 2. Return the budget
    budget = budgetCrl.getBudget();

    // 3. Display the budget on the UI
    UICrl.displayBudget(budget);
  };

  var updatePercentage = function() {
    var percentages;
    // 1. Calculate percentage
    budgetCrl.calculatePercentages();

    // 2. Read from the budget controller
    percentages = budgetCrl.getPercentages();

    // 3. Update the UI
    UICrl.displayPercentages(percentages);
  };

  var crlAddItem = function() {
    var input, newItem;

    // 1. Get the field input data
    input = UICrl.getInput();

    // Prevent blank input fields
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to UI
      UICrl.addListItem(newItem, input.type);

      // 5. Clear the fields
      UICrl.clearFields();

      // 5. Calculate and update the budget
      updateBudget();

      // 6. Calculate and update percentage
      updatePercentage();
    }
  };

  // The callback function addEventListener always has access to 'event' object
  var crlDeleteItem = function(event)  {
    var itemID, splitID, type, ID;
    // Use 'event' object here to find out about clicked target
    // parentNode is for DOM traverse: from the target, it moves up to parent container
    // console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // itemID = inc-0 or exp-0
      // split the itemID into an array of strings
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from our data structure
      budgetCrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Calculate and update percentage
      updatePercentage();
    }
  };

  return {
    init: function() {
      console.log('Application was started.');
      UICrl.displayMonth();
      // Display the budget on the UI
      UICrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
