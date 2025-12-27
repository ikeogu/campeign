<?php

namespace App\Http\Handlers;

// use App\Traits\HideRequestResponseParameters;
use GuzzleHttp\Psr7\Query;
use GuzzleHttp\TransferStats;
use GuzzleLogMiddleware\Handler\HandlerInterface;
use GuzzleLogMiddleware\Handler\LogLevelStrategy\FixedStrategy;
use GuzzleLogMiddleware\Handler\LogLevelStrategy\LogLevelStrategyInterface;
// use Laravel\Telescope\Telescope;
use Psr\Http\Message\MessageInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;
use Throwable;

class GuzzleRequestHandler implements HandlerInterface
{
  // use HideRequestResponseParameters;

  /**
   * @var LogLevelStrategyInterface
   */
  protected $logLevelStrategy;
  /**
   * @var int
   */
  private $truncateSize;
  /**
   * @var int
   */
  private $summarySize;

  /**
   * @param null|LogLevelStrategyInterface $logLevelStrategy
   * @param int                            $truncateSize     If the body of the request/response is greater than the size of this integer the body will be truncated
   * @param int                            $summarySize      The size to use for the summary of a truncated body
   */
  public function __construct(LogLevelStrategyInterface $logLevelStrategy = null, int $truncateSize = 64000, int $summarySize = 3500)
  {
    $this->logLevelStrategy = $logLevelStrategy === null ? $this->getDefaultStrategy() : $logLevelStrategy;
    $this->truncateSize = $truncateSize;
    $this->summarySize = $summarySize;
  }

  /**
   * @param LoggerInterface        $logger
   * @param RequestInterface       $request
   * @param null|ResponseInterface $response
   * @param null|Throwable         $exception
   * @param null|TransferStats     $stats
   * @param array                  $options
   */
  public function log(LoggerInterface $logger, RequestInterface $request, ?ResponseInterface $response = null, ?Throwable $exception = null, ?TransferStats $stats = null, array $options = []): void
  {
    $context['request'] = $this->requestContext($request, $options);

    if ($stats !== null) {
      $context['stats'] = $this->statsContext($stats);
    }

    if ($response !== null) {
      $context['response'] = $this->responseContext($response, $options);
      $level = $this->logLevelStrategy->getLevel($response, $options);
      $logger->log($level, "Guzzle HTTP response for {$context['request']['uri']}", $context);
    } else {
      $context['reason'] = $this->reasonContext($exception);
      if (empty($context['reason'])) {
        $level = $this->logLevelStrategy->getLevel($request, $options);
        $logger->log($level, "Guzzle HTTP request for {$context['request']['uri']}", $context);
      } else {
        $level = $this->logLevelStrategy->getLevel($exception, $options);
        $logger->log($level, "Guzzle HTTP exception for {$context['request']['uri']}", $context);
      }
    }
  }

  /**
   * @return FixedStrategy
   */
  protected function getDefaultStrategy()
  {
    return new FixedStrategy(LogLevel::DEBUG, LogLevel::ERROR);
  }

  /**
   * @param RequestInterface $request
   * @param array            $options
   *
   * @return array
   */
  private function requestContext(RequestInterface $request, array $options)
  {
    $context['method'] = $request->getMethod();
    $context['headers'] = $request->getHeaders();
    $context['uri'] = $request->getRequestTarget();
    $context['version'] = 'HTTP/' . $request->getProtocolVersion();

    if ($request->getBody()->getSize() > 0) {
      $context['body'] = $this->formatBody($request, $options);

      // $context['body'] = $this->hideParameters($context['body'], Telescope::$hiddenRequestParameters);
    }

    return $context;
  }

  /**
   * @param null|ResponseInterface $response
   * @param array                  $options
   *
   * @return array
   */
  private function responseContext(?ResponseInterface $response, array $options)
  {
    $context['headers'] = $response->getHeaders();
    $context['status_code'] = $response->getStatusCode();
    $context['version'] = 'HTTP/' . $response->getProtocolVersion();
    $context['message'] = $response->getReasonPhrase();
    if ($response->getBody()->getSize() > 0) {
      $context['body'] = $this->formatBody($response, $options);

      // $context['body'] = $this->hideParameters($context['body'], Telescope::$hiddenRequestParameters);
    }

    return $context;
  }

  /**
   * @param null|Throwable $exception
   *
   * @return array
   */
  private function reasonContext(?Throwable $exception)
  {
    if ($exception === null) {
      return [];
    }

    $context['reason']['code'] = $exception->getCode();
    $context['reason']['message'] = $exception->getMessage();
    $context['reason']['line'] = $exception->getLine();
    $context['reason']['file'] = $exception->getFile();

    return $context;
  }

  /**
   * @param null|TransferStats $stats
   *
   * @return array
   */
  private function statsContext(?TransferStats $stats)
  {
    return [
      'time' => $stats->getTransferTime(),
      'uri'  => $stats->getEffectiveUri(),
    ];
  }

  /**
   * @param MessageInterface $message
   * @param array            $options
   *
   * @return array|string
   */
  private function formatBody(MessageInterface $message, array $options)
  {
    $stream = $message->getBody();
    if ($stream->isSeekable() === false || $stream->isReadable() === false) {
      return 'Body stream is not seekable/readable.';
    }
    if (isset($options['log']['sensitive']) && $options['log']['sensitive'] === true) {
      return 'Body contains sensitive information therefore it is not included.';
    }
    if ($stream->getSize() >= $this->truncateSize) {
      $summary = $stream->read($this->summarySize) . ' (truncated...)';
      $stream->rewind();

      return $summary;
    }
    $body = $stream->__toString();
    $contentType = $message->getHeader('Content-Type');
    $isJson = preg_grep('/application\/[\w.+]*(json)/', $contentType);
    if (! empty($isJson)) {
      $result = json_decode($body, true);
      $stream->rewind();

      return $result;
    }
    $isForm = preg_grep('/application\/x-www-form-urlencoded/', $contentType);
    if (! empty($isForm)) {
      $result = Query::parse($body);
      $stream->rewind();

      return $result;
    }
    $stream->rewind();

    return $body;
  }
}