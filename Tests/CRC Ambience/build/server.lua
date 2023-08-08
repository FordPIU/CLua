local RN = GetCurrentResourceName()
local SC = {}
local SS = {}
local function GetIdent(src)
    local identifiers = GetPlayerIdentifiers(src)
    local retval = nil
    for _, identifier in pairs(identifiers) do
        if string.find(identifier, AmbientMusic.IdentifierType) then
            retval = string.gsub(identifier, AmbientMusic.IdentifierType, "")
            break
        end
    end
    return retval
end
local function DoesUserExist(uIdent, shouldCreateEntry)
    if uIdent == nil then
        print( "ERR >> FAILED TO FETCH IDENTIFIER (1)")
        return
    end
    if SC[uIdent] == nil then
        if shouldCreateEntry then
            SC[uIdent] = AmbientMusic.DefaultSettings
            return true
        else
            return false
        end
    else
        return true
    end
end
local function SaveData()
    SaveResourceFile(RN, "Settings.json", json.encode(SC), -1)
end
local function UpdateData(src, key, value)
    local uIdent = GetIdent(src)
    if uIdent == nil then
        print( "ERR >> FAILED TO FETCH IDENTIFIER (2)")
        return
    end
    if DoesUserExist(uIdent, true) then
        SC[uIdent][key] = value
    end
end
local function GetData(src)
    local uIdent = GetIdent(src)
    if uIdent == nil then
        print( "ERR >> FAILED TO FETCH IDENTIFIER (3)")
        return
    end
    if DoesUserExist(uIdent, true) then
        return SC[uIdent]
    end
end
Citizen.CreateThread(function()
    SC = json.decode(LoadResourceFile(RN, "Settings.json")) or {}
    while true do
        Wait(2500)
        SaveData()
    end
end)
local function GetVolumeFromSettings(src)
    local UserSettings = GetData(src) or AmbientMusic.DefaultSettings
    local Volume = UserSettings.Vol
    local Paused = UserSettings.Paused
    if Paused then
        print("INFO >> " .. src .. " is paused.")
        return 0.0
    else
        print("INFO >> " .. src .. " is @ " .. Volume)
        return Volume
    end
end
local function PlayAmbience(src)
    local Vol = GetVolumeFromSettings(src)
    print( "Playing sound " .. AmbientMusic.URL .. " at a volume of " .. Vol)
    exports.xsound:PlayUrl(src, src .. "_AMBIENCE", AmbientMusic.URL, Vol, true)
end
RegisterNetEvent("CRC.AMBIENCE::OnLoad", function()
    local src = source
    PlayAmbience(src)
end)
RegisterCommand("musicvolume", function(src, args, _)
    if args[1] == nil then return end
    local NewVolume = tonumber(args[1])
    if NewVolume < AmbientMusic.MinMaxVolume[1] then
        NewVolume = AmbientMusic.MinMaxVolume[1]
    elseif NewVolume > AmbientMusic.MinMaxVolume[2] then
        NewVolume = AmbientMusic.MinMaxVolume[2]
    end
    UpdateData(src, "Vol", NewVolume)
    exports.xsound:setVolume(-1, src .. "_AMBIENCE", NewVolume)
end, false)
RegisterCommand("musictoggle", function(src, _, _)
    local Data = GetData(src)
    local Paused = Data.Paused or AmbientMusic.DefaultSettings.Paused
    local NewPaused = not Paused
    UpdateData(src, "Paused", NewPaused)
    if NewPaused then
        exports.xsound:Pause(-1, src .. "_AMBIENCE")
    else
        exports.xsound:Resume(-1, src .. "_AMBIENCE")
        exports.xsound:setVolume(-1, src .. "_AMBIENCE", Data.Vol or AmbientMusic.DefaultSettings.Vol)
    end
end, false)

