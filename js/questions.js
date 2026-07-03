// Predefined library of 6 core algorithmic/SQL questions with detailed instructions, constraints, and starter code templates.
// Saved inside localStorage under 'antigravity_questions' on initialization.

export const initialQuestions = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    category: "Arrays & Hashmaps",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    functionName: "twoSum",
    templates: {
      javascript: `function twoSum(nums, target) {
    // Write your code here
    
}`,
      python: `def twoSum(nums, target):
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] }
    ]
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "easy",
    category: "Stacks",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "The parentheses are correctly closed."
      },
      {
        input: 's = "()[]{}"',
        output: "true",
        explanation: "All types of brackets are matching in valid order."
      },
      {
        input: 's = "(]"',
        output: "false",
        explanation: "The closed bracket ']' does not match opening parenthese '('."
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses characters only: '()[]{}'"
    ],
    functionName: "isValid",
    templates: {
      javascript: `function isValid(s) {
    // Write your code here
    
}`,
      python: `def isValid(s: str) -> bool:
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([)]"], expected: false },
      { input: ["{[]}"], expected: true }
    ]
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    category: "Two Pointers",
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.

A substring is a contiguous non-empty sequence of characters within a string.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: "The answer is \"abc\", with the length of 3."
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: "The answer is \"b\", with the length of 1."
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: "The answer is \"wke\", with the length of 3. Note that the answer must be a substring, \"pwke\" is a subsequence and not a substring."
      }
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    functionName: "lengthOfLongestSubstring",
    templates: {
      javascript: `function lengthOfLongestSubstring(s) {
    // Write your code here
    
}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { input: ["abcabcbb"], expected: 3 },
      { input: ["bbbbb"], expected: 1 },
      { input: ["pwwkew"], expected: 3 },
      { input: [""], expected: 0 },
      { input: ["au"], expected: 2 }
    ]
  },
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "easy",
    category: "Linked Lists",
    description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.

In JavaScript/Python execution tests, linked lists are passed as normal Arrays \`head\` representing the nodes. Your code should reverse and return the reversed Array.`,
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]"
      },
      {
        input: "head = [1,2]",
        output: "[2,1]"
      }
    ],
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    functionName: "reverseList",
    templates: {
      javascript: `function reverseList(head) {
    // In our browser runner, we simplify by passing head as an array.
    // Return the reversed array.
    return head.reverse();
}`,
      python: `def reverseList(head):
    # In our browser runner, head is a Python list.
    # Return the reversed list.
    return head[::-1]`,
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your code here
        
    }
};`,
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { input: [[1, 2]], expected: [2, 1] },
      { input: [[]], expected: [] }
    ]
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "easy",
    category: "Dynamic Programming",
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps"
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways to climb to the top:\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step"
      }
    ],
    constraints: [
      "1 <= n <= 45"
    ],
    functionName: "climbStairs",
    templates: {
      javascript: `function climbStairs(n) {
    // Write your code here
    
}`,
      python: `def climbStairs(n: int) -> int:
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { input: [2], expected: 2 },
      { input: [3], expected: 3 },
      { input: [4], expected: 5 },
      { input: [5], expected: 8 }
    ]
  },
  {
    id: "sql-customers-never-order",
    title: "Customers Who Never Order",
    difficulty: "easy",
    category: "SQL Databases",
    description: `Table: \`Customers\`
\`\`\`text
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | int     |
| name        | varchar |
+-------------+---------+
\`\`\`
id is the primary key column for this table. Each row of this table indicates the ID and name of a customer.

Table: \`Orders\`
\`\`\`text
+-------------+------+
| Column Name | Type |
+-------------+------+
| id          | int  |
| customerId  | int  |
+-------------+------+
\`\`\`
id is the primary key column for this table. customerId is a foreign key of the ID from the Customers table. Each row indicates the ID of an order and the ID of the customer who ordered it.

Write an SQL query to report all customers who never order anything. Return the result table with a single column header **\`Customers\`** containing names.`,
    examples: [
      {
        input: `Customers table:
+----+-------+
| id | name  |
+----+-------+
| 1  | Joe   |
| 2  | Henry |
| 3  | Sam   |
| 4  | Max   |
+----+-------+
Orders table:
+----+------------+
| id | customerId |
+----+------------+
| 1  | 3          |
| 2  | 1          |
+----+------------+`,
        output: `+-----------+
| Customers |
+-----------+
| Henry     |
| Max       |
+-----------+`
      }
    ],
    constraints: [
      "SQL dialect: Standard SQL / SQLite",
      "Field names in final output table must be exactly: Customers"
    ],
    functionName: "selectCustomers",
    templates: {
      sql: `-- Write your SQL query statement here
SELECT 

;`
    },
    testCases: [
      { input: [], expected: ["Henry", "Max"] }
    ]
  },
  {
    id: "set-matrix-zeroes",
    title: "Set Matrix Zeroes",
    difficulty: "medium",
    category: "Arrays & Matrix (Striver SDE)",
    description: `Given an \`m x n\` integer matrix \`matrix\`, if an element is \`0\`, set its entire row and column to \`0\`'s.

You must do it **in place**. In the browser execution environment, you should modify and return the matrix.`,
    examples: [
      {
        input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]",
        output: "[[1,0,1],[0,0,0],[1,0,1]]"
      },
      {
        input: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]",
        output: "[[0,0,0,0],[3,0,0,2],[1,3,1,5]]"
      }
    ],
    constraints: [
      "m == matrix.length",
      "n == matrix[0].length",
      "1 <= m, n <= 200",
      "-2^31 <= matrix[i][j] <= 2^31 - 1"
    ],
    functionName: "setZeroes",
    templates: {
      javascript: `function setZeroes(matrix) {
    // Write your code here
    
    return matrix;
}`,
      python: `def setZeroes(matrix):
    # Write your code here
    # Modify in place and return matrix for verification
    pass`,
      cpp: `class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        
    }
};`,
      java: `class Solution {
    public void setZeroes(int[][] matrix) {
        
    }
}`
    },
    testCases: [
      { input: [[[1,1,1],[1,0,1],[1,1,1]]], expected: [[1,0,1],[0,0,0],[1,0,1]] },
      { input: [[[0,1,2,0],[3,4,5,2],[1,3,1,5]]], expected: [[0,0,0,0],[3,0,0,2],[1,3,1,5]] }
    ]
  },
  {
    id: "sort-colors",
    title: "Sort Colors (Sort 0s, 1s, 2s)",
    difficulty: "medium",
    category: "Arrays & Sorting (Striver SDE)",
    description: `Given an array \`nums\` with \`n\` objects colored red, white, or blue, sort them **in-place** so that objects of the same color are adjacent, with the colors in the order red, white, and blue.

We will use the integers \`0\`, \`1\`, and \`2\` to represent the color red, white, and blue, respectively.

You must solve this problem without using the library's sort function. In JavaScript/Python execution tests, return the modified array.`,
    examples: [
      {
        input: "nums = [2,0,2,1,1,0]",
        output: "[0,0,1,1,2,2]"
      },
      {
        input: "nums = [2,0,1]",
        output: "[0,1,2]"
      }
    ],
    constraints: [
      "n == nums.length",
      "1 <= n <= 300",
      "nums[i] is either 0, 1, or 2."
    ],
    functionName: "sortColors",
    templates: {
      javascript: `function sortColors(nums) {
    // Write your code here
    
    return nums;
}`,
      python: `def sortColors(nums):
    # Write your code here
    # Return modified array for verification
    pass`,
      cpp: `class Solution {
public:
    void sortColors(vector<int>& nums) {
        
    }
};`,
      java: `class Solution {
    public void sortColors(int[] nums) {
        
    }
}`
    },
    testCases: [
      { input: [[2,0,2,1,1,0]], expected: [0,0,1,1,2,2] },
      { input: [[2,0,1]], expected: [0,1,2] }
    ]
  },
  {
    id: "maximum-subarray",
    title: "Kadane's Algorithm (Maximum Subarray)",
    difficulty: "medium",
    category: "Arrays & DP (Striver SDE)",
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum = 6."
      },
      {
        input: "nums = [1]",
        output: "1"
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23"
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    functionName: "maxSubArray",
    templates: {
      javascript: `function maxSubArray(nums) {
    // Write your code here
    
}`,
      python: `def maxSubArray(nums: list) -> int:
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        
    }
};`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        
    }
}`
    },
    testCases: [
      { input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5,4,-1,7,8]], expected: 23 }
    ]
  },
  {
    id: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "easy",
    category: "Arrays & Greedy (Striver SDE)",
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "In this case, no transactions are done and the max profit = 0."
      }
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4"
    ],
    functionName: "maxProfit",
    templates: {
      javascript: `function maxProfit(prices) {
    // Write your code here
    
}`,
      python: `def maxProfit(prices: list) -> int:
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        
    }
};`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        
    }
}`
    },
    testCases: [
      { input: [[7,1,5,3,6,4]], expected: 5 },
      { input: [[7,6,4,3,1]], expected: 0 },
      { input: [[2,4,1]], expected: 2 }
    ]
  }
];
