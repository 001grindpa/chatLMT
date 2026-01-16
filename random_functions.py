# password = "???????1Uo^"

def check_password(password):
    if len(password) <= 6:
        return "password is short"
    else:
        isdigit = False
        isupper = False
        islower = False
        specialChar = False
        chars = ["@", "!", "&", "=", "^", "$", "%"]
        for c in password:
            if c in chars:
                specialChar = True
            if c.isdigit():
                isdigit = True
            if c.isupper():
                    isupper = True
            if c.islower():
                    islower = True
        if isdigit == True and islower == True and isupper == True and specialChar == True:
                return "valid password"
        else:
            if isdigit == False:
                 return "add a number"
            elif isupper == False:
                 return "add an uppercase"
            elif islower == False:
                 return "add a lowercase"
            elif specialChar == False:
                 return "add a mentioned special character"

# print(check_password(password))