# Example Dockerfile to use in action CI.
FROM python:3.8.3

ARG TESTARG1
ARG TESTARG2
ENV TEST1 ${TESTARG1}
ENV TEST2 ${TESTARG2}

CMD ["python", "-c", "import os;print(os.environ.get('TEST1'));print(os.environ.get('TEST2'))"]
