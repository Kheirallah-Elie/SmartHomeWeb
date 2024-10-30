using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SmartHomeWeb.Server.Model;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace SmartHomeWeb.Server.Services
{
    public class SmartHomeService
    {
        private readonly IMongoCollection<SmartHomeModel> _collection;

        public SmartHomeService(IOptions<MongoDBSettings> mongoDBSettings)
        {
            var client = new MongoClient(mongoDBSettings.Value.ConnectionString);
            var database = client.GetDatabase(mongoDBSettings.Value.DatabaseName);
            _collection = database.GetCollection<SmartHomeModel>("SmartHomeCollection");
        }

        public async Task<List<SmartHomeModel>> GetAllAsync() =>
            await _collection.Find(_ => true).ToListAsync();

        public async Task<SmartHomeModel> GetByIdAsync(string id) =>
            await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(SmartHomeModel data) =>
            await _collection.InsertOneAsync(data);

        public async Task UpdateAsync(string id, SmartHomeModel data) =>
            await _collection.ReplaceOneAsync(x => x.Id == id, data);

        public async Task DeleteAsync(string id) =>
            await _collection.DeleteOneAsync(x => x.Id == id);
    }
}
