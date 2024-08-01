import { Model } from 'sequelize';
import _ from 'lodash';

export default function (sequelize, DataTypes) {
  class Job extends Model {
    static associate(models) {
      Job.belongsTo(models.User);
    }

    toJSON() {
      const json = _.pick(this.get(), ['id', 'UserId', 'file', 'fileUrl', 'fileName', 'response', 'createdAt', 'updatedAt']);
      return json;
    }
  }

  Job.init(
    {
      file: DataTypes.TEXT,
      fileUrl: {
        type: DataTypes.VIRTUAL(DataTypes.TEXT, ['file']),
        get() {
          return this.assetUrl('file');
        },
      },
      fileName: DataTypes.TEXT,
      response: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: 'Job',
    },
  );

  Job.afterSave(async (record, options) => {
    record.handleAssetFile('file', options);
  });

  return Job;
}
