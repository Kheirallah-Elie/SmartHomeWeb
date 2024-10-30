using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace SmartHomeWeb.Server.Model
{
    public class SmartHomeModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string Nom { get; set; }
        public int Age { get; set; }
    }
}
