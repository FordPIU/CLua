let HELLO_WORLD = "Hello World!" 
fn PRINT_HELLO_WORLD() 
    print( HELLO_WORLD)
end
fn add(a, b) 
    return a + b
end
local x = 10
local someTable = {
    "Hello",
    "World",
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9
}
if x > 5 then
    print( "x is greater than 5")
elseif x < 5 then
    print( "x is less than 5")
else
    print( "x is equal to 5")
end
for i = 1, 5 do
    print( "Iteration" .. ": " .. i)
end
for k = 1, 5 do
    print( "Iteration" .. ": " .. k)
end
for i, v in pairs(someTable) do
    print( "Key" .. ": " .. i .. ", Value" .. ": " .. v)
end
for k, v in pairs(someTable) do
    print( "Key: " .. k .. ", Value: " .. v)
end
fn test() return end
local teststr = "function"
print( "Hi!")
local testincrement = 1
testincrement + 1
testincrement = testincrement + 5
print( testincrement)
print( HelloWorld)
print( teststr)
print( add(someTable[5], x))
print( "Hi2")
local bool = false
local bool2 = true
local test5 = {
    "test",
    "test"
}
print( "")
let var20 true
let var21 = true