import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';

const config = {
  region: process.env.AWS_TRANSCRIBE_REGION,
  credentials: {
    accessKeyId: process.env.AWS_TRANSCRIBE_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_TRANSCRIBE_SECRET_ACCESS_KEY,
  },
};
const client = new TranscribeClient(config);

async function startTranscriptionJob(TranscriptionJobName, MediaFileUri, OutputKey) {
  const options = {
    TranscriptionJobName,
    IdentifyLanguage: true,
    Media: {
      MediaFileUri,
    },
    OutputBucketName: process.env.AWS_TRANSCRIBE_BUCKET,
    OutputKey,
    Subtitles: {
      Formats: ['vtt', 'srt'],
      OutputStartIndex: 1,
    },
  };
  return client.send(new StartTranscriptionJobCommand(options));
}

async function getTranscriptionJob(TranscriptionJobName) {
  const options = {
    TranscriptionJobName,
  };
  return client.send(new GetTranscriptionJobCommand(options));
}

export default {
  startTranscriptionJob,
  getTranscriptionJob,
};
