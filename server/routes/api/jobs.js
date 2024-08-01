import express from 'express';
import { StatusCodes } from 'http-status-codes';
import _ from 'lodash';

import helpers from '../helpers.js';
import models from '../../models/index.js';
import interceptors from '../interceptors.js';

const router = express.Router();

router.get('/', interceptors.requireLogin, async (req, res) => {
  const options = {
    page: req.query.page || '1',
    order: [['createdAt', 'DESC']],
    where: {
      UserId: req.user.id,
    },
  };
  const { records, pages, total } = await models.Job.paginate(options);
  helpers.setPaginationHeaders(req, res, options.page, pages, total);
  res.json(records.map((record) => record.toJSON()));
});

router.post('/', interceptors.requireLogin, async (req, res) => {
  const record = models.Job.build(_.pick(req.body, ['file', 'fileName']));
  record.UserId = req.user.id;
  try {
    await record.save();
    res.status(StatusCodes.CREATED).json(record.toJSON());
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        errors: error.errors,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    }
  }
});

router.delete('/:id', interceptors.requireAdmin, async (req, res) => {
  await models.sequelize.transaction(async (transaction) => {
    const record = await models.Job.findByPk(req.params.id, { transaction });
    if (record) {
      if (record.acceptedAt) {
        res.status(StatusCodes.FORBIDDEN).end();
      }
      await record.destroy();
      res.status(StatusCodes.OK).end();
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  });
});

router.get('/:id', async (req, res) => {
  req.logout(async () => {
    const record = await models.Job.findByPk(req.params.id);
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  });
});

export default router;
