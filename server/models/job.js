import { Model } from 'sequelize';
import _ from 'lodash';

import transcribe from '../lib/transcribe.js';

export default function (sequelize, DataTypes) {
  class Job extends Model {
    static associate(models) {
      Job.belongsTo(models.User);
    }

    static async startTranscription(id) {
      const record = await Job.findByPk(id);
      const MediaFileUri = record.getAssetBucketUri('file');
      const OutputKey = MediaFileUri.substring(MediaFileUri.indexOf('jobs/'), MediaFileUri.indexOf('file/'));
      try {
        record.response = await transcribe.startTranscriptionJob(id, MediaFileUri, OutputKey);
      } catch (err) {
        record.response = err;
      }
      await record.save();
    }

    async updateTranscription() {
      try {
        this.response = await transcribe.getTranscriptionJob(this.id);
      } catch (err) {
        this.response = err;
      }
      return this.save();
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
    record.handleAssetFile('file', options, Job.startTranscription);
  });

  return Job;
}
