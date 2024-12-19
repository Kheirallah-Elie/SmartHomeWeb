using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

public class Device
{
    [BsonId]
    public string DeviceId { get; set; } // Use strings for ID consistency with JSON structure
    public string Description { get; set; }
    public bool State { get; set; }
}

public class Room
{
    [BsonId]
    public string RoomId { get; set; }
    public string Name { get; set; }
    public List<Device> Devices { get; set; } = new List<Device>();
}

public class Home
{
    [BsonId]
    public string HomeId { get; set; }
    public string Nickname { get; set; }
    public string Address { get; set; }
    public List<Room> Rooms { get; set; } = new List<Room>();
}

public class User
{
    [BsonId]
    public string UserId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; } // Store hashed passwords here
    public List<Home> Homes { get; set; } = new List<Home>();
}

