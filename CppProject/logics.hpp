#include<bits/stdc++.h>

// Expression Parsing and Conversion Utility [PARSER]
class Parser {
    
    public:
    std::stack<std::string> s;
    std::vector<std::string> expression;
    std::vector<std::string> postfixed;

    // String to Number Converter 
    double string_To_Number (std::string num) {
           double r = 0, i = 0, radix = 10, n = num.length(); 
           bool is_less_than_1 = false;
           while (i<n) {
            if (num[i]=='.') { is_less_than_1 = true; radix = 1; }
            else if ( !is_less_than_1 ) { r = r*radix + (num[i]-'0'); }
            else { radix /= 10; r += (num[i]-'0')*radix; }
            i++;
           }
           return r;
    }

    // Parse Expression from User and Convert Multi-Digit Numbers and Operators and Symbols to Tokens
    void parse_Exp (std::string exp) {

         int i = 0, n = exp.length();
         std::string token;

         while (i<n) {
            if ( isalnum(exp[i]) || exp[i] == '.' ) { token += exp[i]; }
            else if (exp[i] != 32) { 
                if ( !token.empty() ) { 
                    expression.push_back(token);  
                    token.clear();
                }
                if (exp[i] == '-' && (i == 0 || exp[i-1] != ' ' && !isalnum(exp[i-1]) && exp[i-1] != ')')) { token += '_'; }  // Check for Unary minus
                else { token += exp[i]; }
                expression.push_back(token);
                token.clear();
            }
            i++;
         }
         if (!token.empty() && token != " ") { expression.push_back(token); } 
         token.clear();
    } 
    
    // Order of Priority of Operators [BODMAS] for Postfix Conversion
    int order (std::string op) {
        // For Basic Operators
        if (op == "+" || op == "-") { return 1; }
        if (op == "/" || op == "*" || op == "%") { return 2; }
        if (op == "^" || op == "(") { return 3; }
        // For Numbers - 0
        if (isdigit(op[0])) { return 0; }
        // For Functions and Unary operators - 4+
        if (op == "_") { return 4; }
        if (isalpha(op[0])) { return 5; }
        if (op == ")") { return -1; } 
        return 0;
    }
    
    // Convert Given Infix Expression to Postfix Expression for Easy Evaluation
    void infix_To_Postfix () {

        std::string temp; int n = expression.size();

        for (int i=0;i<n;i++) {
         if(order(expression[i]) == 0) { postfixed.push_back(expression[i]); }
         else if(order(expression[i]) == 1 || order(expression[i]) == 2) 
         { 
                 if(s.empty()){s.push(expression[i]); continue;}
                 if(order(s.top())>=order(expression[i]))
                 {
                  while ((!s.empty() && s.top() != "(") && order(expression[i]) <= order(s.top()))
                  {
                    temp = s.top(); s.pop();
                    postfixed.push_back(temp);
                  }
                   s.push(expression[i]);
                 }
                 else { s.push(expression[i]); }
         }
         else if (order(expression[i]) >= 3) { s.push(expression[i]); }
         else {
                while (s.top() != "(") {
                    temp = s.top(); s.pop();
                    postfixed.push_back(temp);
                  }
                s.pop();
         }  
        }
        while (!s.empty()) {
          temp = s.top(); s.pop();
          postfixed.push_back(temp);
        }
    }

    // Clear the Current Expression Stored
    void clear () {
        while (!s.empty()) { s.pop(); }
        expression.clear();
        postfixed.clear();
    }

};

// Calculator Functions and Logic Intelligence Utility [LOGIC]
class Logic {

    public:
    std::stack<double> s;  // Stack for Calculation
    std::unordered_map<std::string,char> operators;  // Operators Knowledge for Calculator

    Logic () {
        operators["+"] = '+';
        operators["-"] = '-';
        operators["_"] = '_';
        operators["*"] = '*';
        operators["/"] = '/';
        operators["%"] = '%';
        operators["^"] = '^';
        operators["Sin"] = 's';
        operators["Cos"] = 'c';
        operators["Tan"] = 't';
        operators["Exp"] = 'e';
        operators["Sqrt"] = 'q';
        operators["Log"] = '1';
        operators["ln"] = '2';
    }
    
    // Evaluate Postfix Expression
    double evalpostfix (Parser* parser) {

        double res, l, r; 
        int n = parser->postfixed.size();
        int j = n-1;

        for(int i=0;i<n;i++) {
            if (parser->postfixed[i][0] == '_' && parser->postfixed[i+1][0] == '_') {  // Handle Multiple/Nested Unary Minus Operators
                parser->postfixed[i] = "+"; 
                parser->postfixed[i+1]  = "null"; // Represent an Operator that does "NOTHING"
            }
            if (parser->postfixed[i] == "null") { i++; }
            if(parser->order(parser->postfixed[i]) == 0) { 
                s.push(((parser->string_To_Number(parser->postfixed[i])))); 
            }
            else {
                if (parser->order(parser->postfixed[i]) < 4) {
                  r = s.top(); s.pop();
                  if (s.empty()) { l=0; } else { l=s.top(); s.pop(); }
                  switch (operators[parser->postfixed[i]]) {
                        case '+' : {res = l+r; break;}
                        case '-' : {res = l-r; break;}
                        case '*' : {res = l*r; break;}
                        case '/' : {res = l/r; break;}
                        case '%' : {res = (int)l%(int)r; break;}
                        case '^' : {res = pow(l,r); break;}
                        default : std::cout<<"Syntax Error"<<std::endl; return 0;
                  }
                }
                else {
                    l = s.top(); s.pop();
                    switch (operators[parser->postfixed[i]]) {
                        case '_' : { res = -l; break; }
                        case 's' : { res = sin(l); break; }
                        case 'c' : { res = cos(l); break; }
                        case 't' : { res = tan(l); break; }
                        case 'e' : { res = exp(l); break; }
                        case 'q' : { res = sqrt(l); break; }
                        case '1' : { res = log10(l); break; }
                        case '2' : { res = log(l); break; }
                        default: std::cout<<"Syntax Error"<<std::endl; return 0;
                    }
                }
                s.push(res);
            }
        }
        return s.top();
    }
    // Function to Clear Cache of Previous Calculation
    void clear () {
        while (!s.empty()) { s.pop(); }
    }
};
